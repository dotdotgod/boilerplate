# 🚀 Authentication Implementation Guide

인증 시스템의 단계별 구현 가이드입니다. 현재 구현 상태를 분석하고 미완성 기능들을 완료하는 방법을 제시합니다.

## 📊 현재 구현 상태 분석

### ✅ 완료된 기능들

#### 1. 기반 아키텍처
- **Zustand 스토어**: `src/store/auth.ts` - 완벽한 상태 관리 구조
- **API 클라이언트**: `src/api/client.ts` - 자동 토큰 갱신 포함
- **라우터 보호**: `src/components/auth/ProtectedRoute.tsx` - 동적 접근 제어
- **타입 정의**: `src/api/user/index.ts` - 완전한 TypeScript 지원

#### 2. 구현된 페이지들
- **로그인 페이지**: `src/pages/sign-in/index.tsx` - UI만 완성, 기능 연결 필요
- **회원가입 페이지**: `src/pages/sign-up/index.tsx` - 기본 구조 완성
- **등록 완료 페이지**: `src/pages/complete-registration/index.tsx` - UI 완성

#### 3. 커스텀 훅들
- **useSignIn**: `src/hooks/useSignIn.ts` - 완전 구현됨
- **useSignUp**: `src/hooks/useSignUp.ts` - 2단계 회원가입 플로우 완성
- **useEmailVerification**: `src/hooks/useEmailVerification.ts` - 이메일 인증 완성
- **useGoogleSignIn**: `src/hooks/useGoogleSignIn.ts` - Google OAuth 준비됨

### 🔄 부분 구현된 기능들

#### 1. TODO 미완성 항목들
```typescript
// src/pages/sign-up/index.tsx:17
// TODO: API 호출로 인증메일 발송

// src/pages/complete-registration/index.tsx:28  
// TODO: API 호출로 토큰 검증 및 이메일 조회

// src/pages/complete-registration/index.tsx:65
// TODO: API 호출로 회원가입 완료
```

#### 2. 로그인 페이지 연결
현재 UI만 있고 `useSignIn` 훅과 연결되지 않음

### ❌ 미구현 기능들

#### 1. 패스워드 리셋 전체 플로우
- 리셋 요청 페이지 (`/reset-password`)
- 리셋 확인 페이지 (`/reset-password/confirm`)
- `usePasswordReset` 훅
- 관련 API 엔드포인트들

#### 2. 에러 처리 개선
- 통일된 에러 메시지 표시
- 네트워크 오류 처리
- 사용자 친화적 피드백

## 🛠️ 구현 로드맵

### Phase 1: 기존 TODO 완료 (1-2일)

#### 1.1 로그인 페이지 기능 연결
```typescript
// src/pages/sign-in/index.tsx 수정
import { useSignIn } from "@/hooks/useSignIn";

export default function SignIn() {
  const { signIn, isLoading, error, clearError } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const result = await signIn({ email, password });
    if (!result.success) {
      // 에러는 hook에서 관리됨
    }
  };
  
  // 기존 UI에 상태 연결
  return (
    <form onSubmit={handleSubmit}>
      {/* 기존 UI + 상태 바인딩 */}
      {error && (
        <div className="text-sm text-destructive" role="alert">
          {error}
        </div>
      )}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
```

#### 1.2 회원가입 페이지 API 연결
```typescript
// src/pages/sign-up/index.tsx 수정
import { useSignUp } from "@/hooks/useSignUp";

export default function SignUp() {
  const { registerEmail, isLoading, error, clearError } = useSignUp();
  const [email, setEmail] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // TODO 제거하고 실제 API 호출
    const result = await registerEmail({ email });
    
    // 성공 시 useSignUp 훅이 자동으로 /sign-up/complete로 이동
  };
  
  // 나머지 구현...
}
```

#### 1.3 등록 완료 페이지 토큰 검증
```typescript
// src/pages/complete-registration/index.tsx 수정
import { useSignUp } from "@/hooks/useSignUp";

export default function CompleteRegistration() {
  const { getRegistrationInfo, completeRegistration, isLoading, error } = useSignUp();
  const [searchParams] = useSearchParams();
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const fetchEmailFromToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setTokenError("Invalid verification link");
        return;
      }
      
      try {
        // TODO 제거하고 실제 API 호출
        const result = await getRegistrationInfo({ token });
        if (result.success) {
          setEmail(result.email!);
          setIsTokenValid(true);
        }
      } catch (error) {
        setTokenError("Failed to verify token");
      }
    };
    
    fetchEmailFromToken();
  }, [searchParams, getRegistrationInfo]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO 제거하고 실제 API 호출
    const result = await completeRegistration({
      token: searchParams.get('token')!,
      name,
      password
    });
    
    // 성공 시 useSignUp 훅이 자동으로 로그인 처리
  };
  
  // 나머지 구현...
}
```

### Phase 2: 패스워드 리셋 구현 (2-3일)

#### 2.1 usePasswordReset 훅 생성
```typescript
// src/hooks/usePasswordReset.ts 새로 생성
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../api";
import type {
  ResetPasswordRequest,
  VerifyResetTokenRequest, 
  ConfirmResetPasswordRequest,
} from "../api/user";
import { isAxiosError } from "axios";

export interface UsePasswordResetReturn {
  // 1단계: 리셋 요청
  requestReset: (
    request: ResetPasswordRequest
  ) => Promise<{ success: boolean; error?: string }>;
  
  // 2단계: 토큰 검증
  verifyResetToken: (
    request: VerifyResetTokenRequest
  ) => Promise<{ success: boolean; email?: string; error?: string }>;
  
  // 3단계: 패스워드 재설정
  confirmReset: (
    request: ConfirmResetPasswordRequest
  ) => Promise<{ success: boolean; error?: string }>;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = () => setError(null);
  
  const requestReset = useCallback(async (request: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.user.resetPassword(request);
      return { success: true };
    } catch (err) {
      let errorMessage = "패스워드 리셋 요청에 실패했습니다.";
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // verifyResetToken, confirmReset 구현...
  
  return {
    requestReset,
    verifyResetToken,
    confirmReset,
    isLoading,
    error,
    clearError,
  };
};
```

#### 2.2 패스워드 리셋 API 추가
```typescript
// src/api/user/index.ts에 추가
export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface VerifyResetTokenResponse {
  email: string;
  success: boolean;
}

export interface ConfirmResetPasswordResponse {
  message: string;
  success: boolean;
}

// API 함수들
export const resetPassword = async (
  request: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(
    "/user/reset-password",
    request
  );
  return response.data;
};

export const verifyResetToken = async (
  request: VerifyResetTokenRequest
): Promise<VerifyResetTokenResponse> => {
  const response = await apiClient.post<VerifyResetTokenResponse>(
    "/user/verify-reset-token",
    request
  );
  return response.data;
};

export const confirmResetPassword = async (
  request: ConfirmResetPasswordRequest
): Promise<ConfirmResetPasswordResponse> => {
  const response = await apiClient.post<ConfirmResetPasswordResponse>(
    "/user/confirm-reset-password",
    request
  );
  return response.data;
};

// userApi 객체에 추가
export const userApi = {
  // 기존 API들...
  resetPassword,
  verifyResetToken,
  confirmResetPassword,
};
```

#### 2.3 패스워드 리셋 페이지들 생성
```typescript
// src/pages/reset-password/index.tsx 새로 생성
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { usePasswordReset } from "@/hooks/usePasswordReset";

export default function ResetPassword() {
  const { requestReset, isLoading, error, clearError } = usePasswordReset();
  const [email, setEmail] = useState("");
  const [isRequested, setIsRequested] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const result = await requestReset({ email });
    if (result.success) {
      setIsRequested(true);
    }
  };
  
  if (isRequested) {
    return <ResetEmailSentView email={email} />;
  }
  
  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* UI 구현 - ui-components.md 참조 */}
        </form>
      </div>
    </div>
  );
}

// src/pages/reset-password/confirm/index.tsx 새로 생성  
export default function ConfirmResetPassword() {
  // 구현 - ui-components.md 참조
}
```

#### 2.4 라우터에 패스워드 리셋 경로 추가
```typescript
// src/App.tsx 수정
import ResetPassword from "./pages/reset-password";
import ConfirmResetPassword from "./pages/reset-password/confirm";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 기존 라우트들... */}
        
        {/* 패스워드 리셋 라우트 추가 */}
        <Route
          path="reset-password"
          element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="reset-password/confirm"
          element={
            <ProtectedRoute requireAuth={false}>
              <ConfirmResetPassword />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
```

### Phase 3: 보안 및 UX 개선 (1-2일)

#### 3.1 10분 토큰 만료 처리
```typescript
// src/utils/tokenUtils.ts 새로 생성
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export function getTokenRemainingTime(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  } catch {
    return 0;
  }
}

// 토큰 만료 카운트다운 훅
export function useTokenCountdown(token: string | null) {
  const [remainingTime, setRemainingTime] = useState(0);
  
  useEffect(() => {
    if (!token) return;
    
    const updateTime = () => {
      setRemainingTime(getTokenRemainingTime(token));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [token]);
  
  return remainingTime;
}
```

#### 3.2 에러 처리 개선
```typescript
// src/components/ui/ErrorAlert.tsx 새로 생성
interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  variant?: "destructive" | "warning";
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  onDismiss, 
  variant = "destructive" 
}) => {
  if (!error) return null;
  
  return (
    <div className={cn(
      "rounded-lg border p-4 text-sm",
      variant === "destructive" 
        ? "border-destructive/20 bg-destructive/10 text-destructive" 
        : "border-yellow-200 bg-yellow-50 text-yellow-800"
    )}>
      <div className="flex items-start gap-3">
        {variant === "destructive" ? (
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        )}
        
        <div className="flex-1">
          <p>{error}</p>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 hover:opacity-70"
            aria-label="에러 메시지 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
```

#### 3.3 로딩 상태 개선
```typescript
// src/components/ui/LoadingButton.tsx 새로 생성
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      className={cn("relative", props.className)}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {isLoading ? (loadingText || "처리 중...") : children}
    </Button>
  );
};
```

### Phase 4: 접근성 및 최적화 (1-2일)

#### 4.1 접근성 개선
```typescript
// src/hooks/useAnnouncer.ts 새로 생성
export function useAnnouncer() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);
  
  return announce;
}

// 사용 예시
const { signIn, isLoading } = useSignIn();
const announce = useAnnouncer();

const handleSubmit = async (e: React.FormEvent) => {
  const result = await signIn(credentials);
  
  if (result.success) {
    announce("로그인에 성공했습니다", "assertive");
  } else {
    announce(`로그인 실패: ${result.error}`, "assertive");
  }
};
```

#### 4.2 성능 최적화
```typescript
// src/pages 컴포넌트들에 React.memo 적용
import { memo } from "react";

const SignIn = memo(() => {
  // 컴포넌트 구현
});

export default SignIn;

// 커스텀 훅에 useMemo/useCallback 적용
export const useSignIn = (redirectTo?: string): UseSignInReturn => {
  const signIn = useCallback(async (credentials) => {
    // 구현
  }, [setAuthenticatedUser, navigate, redirectTo]);
  
  return useMemo(() => ({
    signIn,
    isLoading,
    error,
    clearError,
  }), [signIn, isLoading, error, clearError]);
};
```

## 🧪 테스트 전략

### 단위 테스트
```typescript
// src/hooks/__tests__/useSignIn.test.ts
import { renderHook, act } from "@testing-library/react";
import { useSignIn } from "../useSignIn";

describe("useSignIn", () => {
  test("successful sign in", async () => {
    const { result } = renderHook(() => useSignIn());
    
    await act(async () => {
      const response = await result.current.signIn({
        email: "test@example.com",
        password: "password123"
      });
      
      expect(response.success).toBe(true);
    });
  });
  
  test("failed sign in with invalid credentials", async () => {
    // 테스트 구현
  });
});
```

### 통합 테스트  
```typescript
// src/__tests__/auth-flow.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("Authentication Flow", () => {
  test("complete sign up flow", async () => {
    render(<App />);
    
    // 회원가입 페이지로 이동
    fireEvent.click(screen.getByText("회원가입"));
    
    // 이메일 입력
    await userEvent.type(
      screen.getByLabelText("이메일"), 
      "test@example.com"
    );
    
    // 인증메일 발송 버튼 클릭
    fireEvent.click(screen.getByText("인증메일 발송"));
    
    // 완료 페이지 확인
    await waitFor(() => {
      expect(screen.getByText("이메일을 확인하세요")).toBeInTheDocument();
    });
  });
});
```

## 📋 체크리스트

### Phase 1 완료 체크리스트
- [ ] 로그인 페이지 `useSignIn` 훅 연결
- [ ] 회원가입 페이지 `registerEmail` API 호출
- [ ] 등록 완료 페이지 토큰 검증 API 호출  
- [ ] 등록 완료 페이지 `completeRegistration` API 호출
- [ ] 모든 TODO 주석 제거
- [ ] 기본 에러 처리 추가

### Phase 2 완료 체크리스트
- [ ] `usePasswordReset` 훅 구현
- [ ] 패스워드 리셋 API 3개 추가
- [ ] `/reset-password` 페이지 구현
- [ ] `/reset-password/confirm` 페이지 구현
- [ ] 라우터에 패스워드 리셋 경로 추가
- [ ] 로그인 페이지에서 "비밀번호 찾기" 링크 연결

### Phase 3 완료 체크리스트  
- [ ] 10분 토큰 만료 처리 유틸리티
- [ ] 토큰 만료 카운트다운 컴포넌트
- [ ] 에러 알림 컴포넌트 추가
- [ ] 로딩 버튼 컴포넌트 추가
- [ ] 네트워크 에러 처리 개선

### Phase 4 완료 체크리스트
- [ ] 스크린 리더 지원 추가
- [ ] 키보드 네비게이션 개선
- [ ] 접근성 자동 안내 시스템
- [ ] React.memo 최적화 적용
- [ ] useMemo/useCallback 최적화
- [ ] 번들 크기 최적화

### 최종 검증 체크리스트
- [ ] 모든 인증 플로우 E2E 테스트 통과
- [ ] ESLint 에러 0개
- [ ] TypeScript 컴파일 에러 0개  
- [ ] 접근성 검증 (WCAG 2.1 AA)
- [ ] 모바일 반응형 테스트
- [ ] 크로스 브라우저 테스트

## 🎯 성공 지표

### 기능 완성도
- **회원가입 완료율**: >85% (10분 내 완료)
- **로그인 성공률**: >95% (정상 자격증명)
- **패스워드 리셋 완료율**: >80% (링크 클릭 후)

### 기술 지표
- **페이지 로딩 시간**: <2초 (Lighthouse)
- **접근성 점수**: >90 (Lighthouse)
- **번들 크기**: 초기 <500KB
- **API 응답 시간**: <200ms (평균)

### 사용자 경험
- **오류율**: <5% (사용자 세션)
- **이탈률**: <15% (인증 플로우)
- **재시도 횟수**: <2회 (평균)

이 구현 가이드를 따라 단계적으로 진행하면 완전하고 안전한 인증 시스템을 구축할 수 있습니다.