# Frontend Development Conventions & Specifications

## 프로젝트 구조 및 기술 스택

### 기본 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand (with immer, subscribeWithSelector middleware)
- **HTTP Client**: Axios
- **UI Components**: Radix UI + Tailwind CSS
- **Styling**: Tailwind CSS + CSS Variables
- **Package Manager**: pnpm

### 폴더 구조

```
src/
├── api/                    # API 관련 모듈
│   ├── index.ts           # 통합 API 객체 (api.*)
│   ├── client.ts          # Axios 인스턴스 및 인터셉터
│   └── user/              # 도메인별 API
│       └── index.ts       # user API 메소드들
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트 (Radix + Tailwind)
├── hooks/                # 커스텀 훅
├── pages/                # 페이지 컴포넌트
├── store/                # Zustand 스토어
│   ├── index.ts          # 스토어 통합 및 유틸리티
│   └── auth.ts           # 인증 스토어
└── lib/                  # 유틸리티 함수들
```

## 코딩 컨벤션

### 파일명 규칙

- **Pages**: `kebab-case` 폴더, `index.tsx` 파일 (`pages/sign-up/index.tsx`)
- **Components**: `PascalCase` 파일명 (`Button.tsx`)
- **Hooks**: `camelCase` with `use` prefix (`useSignIn.ts`)
- **Stores**: `camelCase` (`auth.ts`)
- **API**: 도메인별 폴더 + `index.ts` (`api/user/index.ts`)

### Import/Export 규칙

```typescript
// API 사용 - 반드시 통합 객체 사용
import { api } from "../api";
api.user.emailPasswordSignIn(credentials);

// 타입 import는 별도로
import type { User } from "../api/user";

// 컴포넌트 default export
export default function SignIn() {}

// 훅은 named export
export const useSignIn = () => {};
```

### TypeScript 규칙

- **Interface 네이밍**: Request/Response 접미사 (`EmailPasswordSignInRequest`)
- **타입 정의**: API 파일에서 정의 후 re-export
- **Props 타입**: 컴포넌트명 + Props (`SignInProps`)

## 상태 관리 (Zustand)

### 스토어 구조

```typescript
// 상태와 액션 분리
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setAuthenticatedUser: (user: User, accessToken: string) => void;
  reset: () => void;
}

// immer + subscribeWithSelector 미들웨어 필수 사용
export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // 구현
    }))
  )
);
```

### 상태 관리 원칙

1. **순수한 상태 관리**: Zustand는 상태만 관리, API 호출은 훅에서
2. **원자적 업데이트**: `setAuthenticatedUser(user, token)` 처럼 관련 상태 한번에 업데이트
3. **토큰 관리**: 모든 accessToken 관리는 Zustand에서 중앙집중화

## API 설계

### API 구조

```typescript
// api/index.ts - 통합 API 객체
export const api = {
  user, // user 도메인 API들
};

// 사용법
import { api } from "../api";
const response = await api.user.emailPasswordSignIn(credentials);
```

### API 메소드 패턴

```typescript
export const emailPasswordSignIn = async (
  request: EmailPasswordSignInRequest
): Promise<AuthSuccessResponse> => {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/user/sign-in",
    request
  );
  return response.data; // 순수하게 데이터만 반환
};
```

### 에러 처리

- API 함수는 순수하게 데이터만 반환
- 에러 처리는 각 훅에서 `isAxiosError` 사용
- 일관된 에러 메시지 형태 유지

## 커스텀 훅 패턴

### 훅 구조

```typescript
export interface UseSignInReturn {
  signIn: (
    credentials: EmailPasswordSignInRequest
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useSignIn = (redirectTo?: string): UseSignInReturn => {
  // 1. 로컬 상태 (loading, error)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. 스토어 구조분해 할당 (한 번만 호출)
  const { setAuthenticatedUser } = useAuthStore((state) => ({
    setAuthenticatedUser: state.setAuthenticatedUser,
  }));

  // 3. API 호출 + 상태 업데이트
  const signIn = useCallback(
    async (credentials) => {
      try {
        const response = await api.user.emailPasswordSignIn(credentials);
        setAuthenticatedUser(response.user, response.access_token);
        return { success: true };
      } catch (err) {
        // 에러 처리
      }
    },
    [setAuthenticatedUser]
  );

  return { signIn, isLoading, error, clearError };
};
```

### 훅 원칙

1. **책임 분리**: 로딩/에러는 useState, 비즈니스 상태는 Zustand
2. **일관된 반환값**: `{ success: boolean; error?: string }` 패턴
3. **useAuthStore 최적화**: 구조분해 할당으로 한 번만 호출

## 인증 플로우

### 토큰 관리

```typescript
// client.ts - axios interceptor에서 자동 토큰 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 에러 시 자동 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
      const response = await axios.post("/v1/user/refresh");
      useAuthStore.getState().setAccessToken(response.data.accessToken);
      // 원래 요청 재시도
    }
  }
);
```

### 인증 상태 초기화

```typescript
// App.tsx 또는 main.tsx에서
useAuthStore.getState().initializeAuth();
```

## 라우팅

### 라우터 구조

```typescript
// App.tsx
<Routes>
  <Route index element={<SignIn />} />
  <Route path="sign-in" element={<SignIn />} />
  <Route path="sign-up" element={<SignUp />}>
    <Route path="complete" element={<SignUpComplete />} />
  </Route>
  <Route path="complete-registration" element={<CompleteRegistration />} />
</Routes>
```

### 네비게이션 패턴

```typescript
// 훅에서 자동 리다이렉트
const navigate = useNavigate();
navigate(destination, { replace: true }); // replace 사용으로 뒤로가기 방지
```

## UI 컴포넌트

### 컴포넌트 구조

- **Radix UI**: 접근성과 기능성
- **Tailwind CSS**: 스타일링
- **CSS Variables**: 테마 관리

### 스타일링 원칙

- Tailwind utility classes 우선 사용
- 복잡한 스타일은 CSS variables 활용
- 컴포넌트별 일관된 스타일 패턴 유지

## 테스트 및 빌드

### 개발 명령어

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint 실행
pnpm typecheck    # TypeScript 타입 체크
```

### 코드 품질

- TypeScript strict mode 사용
- ESLint + Prettier 설정
- 빌드 시 타입 에러 zero tolerance

## 주요 패턴 요약

1. **API 호출**: `api.domain.method()` 구조
2. **상태 관리**: Zustand (비즈니스) + useState (UI)
3. **에러 처리**: 각 훅에서 일관된 패턴
4. **토큰 관리**: 중앙집중화 (axios interceptor + Zustand)
5. **파일 구조**: 도메인별 분리 + 명확한 네이밍
6. **타입 안전성**: 모든 API 요청/응답 타입 정의

이 스펙을 따라 개발하면 일관성 있고 유지보수 가능한 프론트엔드 코드를 작성할 수 있습니다.
