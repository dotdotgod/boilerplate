# 🎨 Authentication UI Components

인증 시스템의 UI 컴포넌트 명세서입니다. 디자인 시스템, 접근성, 반응형 디자인을 포함한 상세한 가이드라인을 제공합니다.

## 🎯 디자인 원칙

### 사용자 경험 우선순위
1. **단순성**: 복잡한 절차 없이 직관적인 인터페이스
2. **신뢰성**: 안전하고 전문적인 느낌의 디자인
3. **접근성**: 모든 사용자가 쉽게 사용할 수 있는 인터페이스
4. **일관성**: 기존 디자인 시스템과 완벽히 통합

### 비주얼 스타일
```css
/* 색상 팔레트 (Tailwind CSS 기반) */
:root {
  --primary: 222.2 84% 4.9%;      /* slate-950 */
  --primary-foreground: 210 40% 98%; /* slate-50 */
  --muted: 210 40% 96%;           /* slate-100 */
  --muted-foreground: 215.4 16.3% 46.9%; /* slate-600 */
  --destructive: 0 84.2% 60.2%;   /* red-500 */
  --border: 214.3 31.8% 91.4%;    /* slate-200 */
}
```

## 📱 페이지별 컴포넌트 명세

### 1. 로그인 페이지 (`/sign-in`)

#### 컴포넌트 구조
```jsx
<div className="min-h-svh flex items-center justify-center p-6 md:p-10">
  <div className="w-full max-w-xs">
    <SignInForm />
  </div>
</div>
```

#### SignInForm 컴포넌트
```typescript
interface SignInFormProps {
  redirectTo?: string;
  onGoogleSignIn?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ redirectTo, onGoogleSignIn }) => {
  // useSignIn hook 사용
  // Google OAuth 처리
  // 폼 검증 및 제출
};
```

#### 접근성 구현
```jsx
<form onSubmit={handleSubmit} aria-label="로그인 폼">
  <div className="flex flex-col items-center gap-2 text-center">
    <h1 className="text-2xl font-bold">계정에 로그인</h1>
    <p className="text-muted-foreground text-sm text-balance">
      이메일과 비밀번호를 입력하여 로그인하세요
    </p>
  </div>
  
  <div className="grid gap-6">
    <div className="grid gap-3">
      <Label htmlFor="email">이메일</Label>
      <Input
        id="email"
        type="email"
        placeholder="m@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-describedby={emailError ? "email-error" : undefined}
        aria-invalid={!!emailError}
      />
      {emailError && (
        <p id="email-error" className="text-sm text-destructive" role="alert">
          {emailError}
        </p>
      )}
    </div>
    
    <div className="grid gap-3">
      <div className="flex items-center">
        <Label htmlFor="password">비밀번호</Label>
        <Link
          to="/reset-password"
          className="ml-auto text-sm underline-offset-4 hover:underline"
        >
          비밀번호 찾기
        </Link>
      </div>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-describedby={passwordError ? "password-error" : undefined}
        aria-invalid={!!passwordError}
      />
    </div>
    
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isLoading}
      aria-describedby="login-status"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          로그인 중...
        </>
      ) : (
        "로그인"
      )}
    </Button>
  </div>
</form>
```

#### 반응형 디자인
```css
/* 모바일 퍼스트 (320px~) */
.sign-in-container {
  @apply min-h-svh flex items-center justify-center p-4;
}

.sign-in-form {
  @apply w-full max-w-xs;
}

/* 태블릿 (768px~) */
@media (min-width: 768px) {
  .sign-in-container {
    @apply p-10;
  }
  
  .sign-in-form {
    @apply max-w-sm;
  }
}

/* 데스크톱 (1024px~) */
@media (min-width: 1024px) {
  .sign-in-form {
    @apply max-w-md;
  }
}
```

### 2. 회원가입 페이지 (`/sign-up`)

#### 단순한 이메일 입력 폼
```jsx
const SignUpForm: React.FC = () => {
  const { registerEmail, isLoading, error, clearError } = useSignUp();
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-muted-foreground text-sm text-balance">
          이메일을 입력하면 인증 링크를 보내드립니다
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-describedby={error ? "signup-error" : undefined}
          />
          {error && (
            <p id="signup-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
          {isLoading ? "인증메일 발송 중..." : "인증메일 발송"}
        </Button>
      </div>
      
      <div className="text-center text-sm">
        이미 계정이 있나요?{" "}
        <Link to="/sign-in" className="underline underline-offset-4">
          로그인
        </Link>
      </div>
    </form>
  );
};
```

### 3. 인증 대기 페이지 (`/sign-up/complete`)

#### 이메일 확인 안내
```jsx
const SignUpComplete: React.FC = () => {
  const [countdown, setCountdown] = useState(60); // 재발송 카운트다운
  const { resendVerificationEmail, isLoading } = useEmailVerification();
  
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">이메일을 확인하세요</h1>
          <p className="text-muted-foreground text-sm">
            <strong className="font-medium">{email}</strong>로<br />
            인증 링크를 보냈어요
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          💡 메일이 보이지 않나요? 스팸함도 확인해보세요
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">메일이 오지 않았나요?</p>
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
            className="w-full"
          >
            {countdown > 0 ? (
              `${countdown}초 후 재발송 가능`
            ) : isLoading ? (
              "재발송 중..."
            ) : (
              "인증메일 재발송"
            )}
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => navigate("/sign-up")}
          className="w-full"
        >
          다른 이메일로 가입하기
        </Button>
      </div>
    </div>
  );
};
```

### 4. 등록 완료 페이지 (`/complete-registration?token=xxx`)

#### 개인정보 입력 폼
```jsx
const CompleteRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // 토큰 검증 및 이메일 정보 로드
  const { 
    getRegistrationInfo, 
    completeRegistration, 
    isLoading, 
    error 
  } = useSignUp();
  
  if (tokenError) {
    return <TokenErrorView error={tokenError} />;
  }
  
  if (!isTokenValid) {
    return <TokenValidatingView />;
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">거의 다 됐어요!</h1>
        <p className="text-muted-foreground text-sm">
          마지막으로 개인정보를 입력해주세요
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-muted cursor-not-allowed"
          />
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="name">이름 <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            type="text"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            autoComplete="name"
          />
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="password">비밀번호 <span className="text-destructive">*</span></Label>
          <Input
            id="password"
            type="password"
            placeholder="8자 이상의 비밀번호"
            value={password}
            onChange={handlePasswordChange}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">비밀번호 확인 <span className="text-destructive">*</span></Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {passwordMismatch && (
            <p className="text-sm text-destructive" role="alert">
              비밀번호가 일치하지 않습니다
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "계정 생성 중..." : "가입 완료"}
        </Button>
      </div>
    </form>
  );
};
```

### 5. 패스워드 리셋 페이지 (`/reset-password`)

#### 리셋 요청 폼
```jsx
const ResetPassword: React.FC = () => {
  const { requestReset, isLoading, error, clearError } = usePasswordReset();
  const [email, setEmail] = useState("");
  const [isRequested, setIsRequested] = useState(false);
  
  if (isRequested) {
    return <ResetEmailSentView email={email} onBack={() => setIsRequested(false)} />;
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <KeyRound className="w-6 h-6 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="text-muted-foreground text-sm text-balance">
          계정 이메일을 입력하시면<br />
          비밀번호 재설정 링크를 보내드려요
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="계정 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
          {isLoading ? "링크 발송 중..." : "리셋 링크 발송"}
        </Button>
        
        <Button variant="ghost" asChild className="w-full">
          <Link to="/sign-in">로그인으로 돌아가기</Link>
        </Button>
      </div>
    </form>
  );
};
```

### 6. 패스워드 재설정 페이지 (`/reset-password/confirm?token=xxx`)

#### 새 비밀번호 설정
```jsx
const ConfirmResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { confirmReset, verifyResetToken, isLoading } = usePasswordReset();
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">새 비밀번호 설정</h1>
        <p className="text-muted-foreground text-sm">
          <strong>{email}</strong> 계정의<br />
          새로운 비밀번호를 설정하세요
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">새 비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="8자 이상의 새 비밀번호"
            value={password}
            onChange={handlePasswordChange}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="새 비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "비밀번호 변경 중..." : "비밀번호 변경"}
        </Button>
      </div>
    </form>
  );
};
```

## 🧩 공통 UI 컴포넌트

### 1. PasswordStrengthIndicator

#### 비밀번호 강도 표시기
```jsx
interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const strength = calculatePasswordStrength(password);
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= strength 
                ? strength <= 2 
                  ? "bg-destructive" 
                  : strength === 3 
                  ? "bg-yellow-500" 
                  : "bg-green-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {getStrengthLabel(strength)}
      </p>
    </div>
  );
};

function calculatePasswordStrength(password: string): number {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  return Math.min(score, 4);
}

function getStrengthLabel(strength: number): string {
  const labels = [
    "매우 약함",
    "약함", 
    "보통",
    "강함",
    "매우 강함"
  ];
  return labels[strength] || "";
}
```

### 2. ErrorBoundary

#### 인증 관련 에러 처리
```jsx
interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({ 
  children, 
  fallback: Fallback = DefaultErrorFallback 
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const resetError = useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);
  
  if (hasError && error) {
    return <Fallback error={error} resetError={resetError} />;
  }
  
  return <>{children}</>;
};

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <div className="text-center space-y-4">
    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
      <AlertCircle className="w-6 h-6 text-destructive" />
    </div>
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "알 수 없는 오류가 발생했습니다"}
      </p>
    </div>
    <div className="space-y-2">
      <Button onClick={resetError} className="w-full">
        다시 시도
      </Button>
      <Button variant="ghost" asChild className="w-full">
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  </div>
);
```

### 3. LoadingSpinner

#### 공통 로딩 인디케이터
```jsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  text, 
  className 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground text-center">
          {text}
        </p>
      )}
    </div>
  );
};

// 전체 페이지 로딩
const PageLoadingSpinner: React.FC<{ text?: string }> = ({ text = "로딩 중..." }) => (
  <div className="min-h-svh flex items-center justify-center p-6">
    <LoadingSpinner size="lg" text={text} />
  </div>
);
```

## 📱 모바일 최적화

### 터치 인터페이스
```css
/* 터치 가능 영역 최소 크기 */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* 버튼 간격 */
.button-group {
  @apply space-y-3;
}

/* 입력 필드 크기 */
.mobile-input {
  @apply text-base; /* 16px - iOS 자동 줌 방지 */
  @apply py-3 px-4; /* 충분한 터치 영역 */
}
```

### 키보드 대응
```jsx
// iOS Safari 키보드 처리
const useKeyboardAware = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        setKeyboardHeight(keyboardHeight);
      }
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return keyboardHeight;
};

// 키보드 상태에 따른 스타일 조정
const MobileForm: React.FC = () => {
  const keyboardHeight = useKeyboardAware();
  
  return (
    <div 
      className="min-h-svh flex items-center justify-center p-6"
      style={{ 
        paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : undefined 
      }}
    >
      {/* 폼 내용 */}
    </div>
  );
};
```

## ♿ 접근성 가이드라인

### 스크린 리더 지원
```jsx
// 적절한 라벨링
<Input
  id="email"
  type="email"
  aria-label="이메일 주소"
  aria-describedby="email-help email-error"
  aria-required="true"
  aria-invalid={hasError}
/>

// 상태 안내
<div id="email-help" className="sr-only">
  유효한 이메일 형식으로 입력해주세요
</div>

// 에러 메시지
{error && (
  <div id="email-error" role="alert" className="text-sm text-destructive">
    {error}
  </div>
)}

// 로딩 상태 안내
<div role="status" aria-live="polite" className="sr-only">
  {isLoading ? "로그인 중입니다" : ""}
</div>
```

### 키보드 네비게이션
```jsx
// Tab 순서 관리
const AuthForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    // 첫 번째 입력 필드에 포커스
    const firstInput = formRef.current?.querySelector('input');
    firstInput?.focus();
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter 키로 폼 제출
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Escape 키로 에러 메시지 닫기
    if (e.key === 'Escape') {
      clearError();
    }
  };
  
  return (
    <form 
      ref={formRef} 
      onKeyDown={handleKeyDown}
      className="space-y-6"
    >
      {/* 폼 요소들 */}
    </form>
  );
};
```

### 색상 및 대비
```css
/* WCAG AA 준수 대비율 (4.5:1 이상) */
.text-primary {
  color: hsl(222.2 84% 4.9%); /* 충분한 대비 */
}

.text-muted-foreground {
  color: hsl(215.4 16.3% 46.9%); /* 4.5:1 대비 */
}

.text-destructive {
  color: hsl(0 84.2% 60.2%); /* 에러 색상 */
}

/* 포커스 표시 */
.focus-visible {
  @apply outline-2 outline-offset-2 outline-ring;
}

/* 색상에만 의존하지 않는 상태 표시 */
.error-state {
  @apply border-destructive text-destructive;
}

.error-state::before {
  content: "⚠️ ";
  @apply mr-1;
}
```

이러한 UI 컴포넌트 명세를 통해 일관되고 접근 가능한 인증 인터페이스를 구축할 수 있습니다.