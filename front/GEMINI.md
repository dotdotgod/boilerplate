
# Gemini-CLI 메타데이터 (`/front`)

이 문서는 Gemini-CLI가 **프론트엔드 애플리케이션**의 구조와 스크립트, 핵심 아키텍처 패턴을 이해하는 데 도움을 주기 위해 작성되었습니다.

##  역할

React(Vite) 기반의 웹 애플리케이션입니다. 사용자 인터페이스(UI)를 제공하며, API 서버와 통신하여 데이터를 보여주고 사용자 입력을 처리합니다.

## ✅ 주요 기술 스택

- **프레임워크/라이브러리**: React 18
- **빌드 도구**: Vite
- **언어**: TypeScript (Strict Mode)
- **스타일링**: Tailwind CSS (with CSS Variables)
- **UI 컴포넌트**: shadcn/ui (Radix UI 기반)
- **상태 관리**: Zustand (immer, subscribeWithSelector 미들웨어 사용)
- **HTTP 클라이언트**: Axios
- **라우팅**: React Router
- **패키지 매니저**: pnpm

## 📜 주요 명령어

- **의존성 설치**:
  ```bash
  pnpm install
  ```
- **개발 서버 실행**:
  ```bash
  pnpm run dev
  ```
- **프로덕션 빌드**:
  ```bash
  pnpm run build
  ```
- **코드 린팅**:
  ```bash
  pnpm run lint
  ```

## 🗂️ 디렉토리 구조

- **`src/`**: 핵심 소스 코드가 위치합니다.
  - **`main.tsx`**: 애플리케이션 진입점.
  - **`App.tsx`**: 최상위 컴포넌트 및 라우팅 설정.
  - **`pages/`**: 페이지 컴포넌트. (디렉토리: `kebab-case`, 파일: `index.tsx`)
  - **`components/`**: 재사용 가능한 컴포넌트. (파일: `PascalCase.tsx`)
    - **`ui/`**: shadcn/ui를 통해 생성된 기본 UI 컴포넌트.
    - **`auth/`**: 인증 관련 컴포넌트 (e.g., `ProtectedRoute`).
  - **`api/`**: API 통신 모듈.
    - **`client.ts`**: Axios 인스턴스 및 인터셉터 설정.
    - **`index.ts`**: 모든 도메인 API를 통합하여 `api` 객체로 export.
    - **`user/`**: `user` 도메인 API 함수.
  - **`hooks/`**: 비즈니스 로직을 포함하는 커스텀 훅. (파일: `useCamelCase.ts`)
  - **`store/`**: Zustand를 사용한 전역 상태 관리. (파일: `camelCase.ts`)
  - **`lib/`**: 유틸리티 함수 (e.g., `cn`).

## 💡 핵심 아키텍처 및 패턴

### 1. API 호출 패턴

- **통합 API 객체 사용**: 모든 API 호출은 `src/api/index.ts`에서 export하는 `api` 객체를 통해 이루어져야 합니다.
  ```typescript
  import { api } from '~/api';
  const userInfo = await api.user.getProfile();
  ```
- **순수 데이터 반환**: API 함수는 `response.data`만 반환하고, 에러 처리는 호출하는 쪽(주로 커스텀 훅)에서 담당합니다.
- **타입 정의**: 모든 요청/응답에 대한 타입은 API 파일 내에 `PascalCase` + `Request`/`Response` 접미사를 사용하여 정의합니다.

### 2. 상태 관리 (Zustand)

- **역할 분리**: Zustand 스토어는 **순수한 상태와 그 상태를 변경하는 액션**만 관리합니다. API 호출과 같은 비동기 로직은 커스텀 훅에서 처리합니다.
- **중앙 집중 토큰 관리**: `accessToken`은 `auth.ts` 스토어에서 중앙 관리하며, Axios 인터셉터에서 이 값을 참조합니다.
- **원자적 업데이트**: `setAuthenticatedUser(user, token)`과 같이 관련된 상태는 하나의 액션으로 묶어 동시에 업데이트합니다.

### 3. 커스텀 훅 패턴 (`/hooks`)

- **책임 분리**:
  - **UI 상태 (로딩, 에러)**: `useState`를 사용하여 훅 내에서 관리합니다.
  - **비즈니스/전역 상태**: `useAuthStore()`와 같은 Zustand 스토어를 통해 관리합니다.
- **일관된 반환값**: API를 호출하고 결과를 처리하는 함수는 `{ success: boolean; error?: string }` 형태의 객체를 반환하여 UI 컴포넌트에서 처리하기 용이하게 만듭니다.
- **Zustand 최적화**: `useAuthStore(state => state.actions)`와 같이 필요한 상태나 액션만 선택하여 불필요한 리렌더링을 방지합니다.

### 4. 인증 처리

- **JWT 토큰 주입**: `api/client.ts`의 Axios 요청 인터셉터가 `authStore`에서 `accessToken`을 가져와 모든 요청의 `Authorization` 헤더에 자동으로 추가합니다.
- **자동 토큰 갱신**: 응답 인터셉터가 401 에러를 감지하면, 자동으로 Refresh Token을 사용하여 Access Token을 갱신하고, 실패했던 원래 요청을 재시도합니다.

이러한 규칙과 패턴을 따르면 코드의 일관성을 유지하고 예측 가능성을 높일 수 있습니다.
