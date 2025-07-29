# 🔐 Authentication PRD

> **버전**: 1.0  
> **작성일**: 2025-01-29  
> **작성자**: Development Team  
> **최종 수정일**: 2025-01-29  

## 📋 개요

### 목적
- **비즈니스 목표**: 안전하고 사용자 친화적인 인증 시스템 구축으로 사용자 온보딩 향상
- **사용자 가치**: 간편한 회원가입, 로그인, 패스워드 관리 기능 제공
- **성공 지표**: 
  - 회원가입 완료율 > 85%
  - 로그인 성공률 > 95%
  - 패스워드 리셋 완료율 > 80%
  - 평균 회원가입 소요시간 < 3분

### 범위
- **포함 사항**: 
  - 이메일/비밀번호 기반 회원가입 및 로그인
  - Google OAuth 소셜 로그인
  - 이메일 인증 시스템
  - 패스워드 리셋 기능
  - 토큰 기반 세션 관리
- **제외 사항**: 
  - 다른 소셜 로그인 (Facebook, Apple 등)
  - 2FA (2단계 인증)
  - 기업용 SSO 연동
- **종속성**: 
  - 백엔드 API 서버
  - 이메일 발송 서비스
  - Google OAuth 2.0 설정

## 👥 사용자 스토리

### 주요 사용자 (Primary Users)

#### 신규 사용자 (회원가입)
```
As a 새로운 사용자,
I want to 이메일 주소만으로 쉽게 가입할 수 있기를,
So that 복잡한 절차 없이 빠르게 서비스를 이용할 수 있다.
```

#### 기존 사용자 (로그인)
```
As a 기존 사용자,
I want to 이메일과 비밀번호로 안전하게 로그인하기를,
So that 내 계정과 데이터에 접근할 수 있다.
```

#### 패스워드 분실 사용자
```
As a 비밀번호를 잊어버린 사용자,
I want to 이메일을 통해 비밀번호를 재설정하기를,
So that 다시 내 계정에 접근할 수 있다.
```

### 사용자 플로우

#### 1. 회원가입 플로우 (이메일 인증)
1. **이메일 입력** → 회원가입 페이지에서 이메일 주소 입력
2. **인증 메일 발송** → 시스템이 인증 링크가 포함된 이메일 발송
3. **완료 안내** → "인증 메일을 확인해주세요" 페이지 표시
4. **이메일 클릭** → 사용자가 이메일의 인증 링크 클릭 (10분 이내)
5. **정보 입력** → 이름, 비밀번호 입력 페이지
6. **가입 완료** → 자동 로그인 후 워크스페이스로 이동

#### 2. 로그인 플로우
1. **로그인 페이지** → 이메일, 비밀번호 입력
2. **인증 처리** → 서버에서 자격증명 검증
3. **성공/실패** → 성공 시 워크스페이스 이동, 실패 시 에러 메시지
4. **Google 로그인** → (선택적) Google OAuth를 통한 소셜 로그인

#### 3. 패스워드 리셋 플로우
1. **리셋 요청** → 로그인 페이지에서 "비밀번호 찾기" 클릭
2. **이메일 입력** → 계정 이메일 주소 입력
3. **리셋 메일 발송** → 패스워드 재설정 링크 이메일 발송
4. **링크 클릭** → 이메일의 리셋 링크 클릭 (10분 이내)
5. **새 비밀번호** → 새로운 비밀번호 입력 및 확인
6. **완료** → 리셋 완료 후 로그인 페이지로 이동

## 🔧 기술 요구사항

### Frontend 요구사항
- **Framework**: React 19 + TypeScript
- **상태 관리**: Zustand with immer + subscribeWithSelector middleware
- **UI 컴포넌트**: Radix UI + Tailwind CSS
- **라우팅**: React Router v7 with protected routes
- **입력 처리**: 커스텀 hooks 패턴 (useSignIn, useSignUp 등), form 태그 사용 금지, div 기반 구조
- **HTTP 클라이언트**: Axios with interceptors
- **구조 원칙**: 불필요한 추상화 레이어 지양, 직접적인 상태 관리

### Backend 요구사항
- **API 엔드포인트**: RESTful API (/v1/user/*)
- **인증**: JWT Access Token + HTTP-only Refresh Token
- **데이터베이스**: User, EmailVerification, RefreshToken entities
- **이메일**: SMTP 기반 이메일 발송 서비스
- **OAuth**: Google OAuth 2.0 통합

### 성능 요구사항
- **API 응답 시간**: < 200ms (로그인/회원가입)
- **이메일 발송 시간**: < 5초
- **페이지 로딩 시간**: < 2초
- **토큰 갱신**: 자동 (사용자가 인지 불가)

## 🛡️ 보안 요구사항

### 토큰 관리
- **Access Token**: 
  - 15분 만료 (메모리 저장)
  - Bearer 형태로 API 요청 헤더에 포함
  - 자동 갱신 (Refresh Token 사용)
- **Refresh Token**: 
  - 7일 만료 (HTTP-only 쿠키)
  - 갱신 시 rotation 적용
  - 탈취 방지를 위한 secure 설정
- **인증 링크**: 
  - 10분 만료 (JWT 토큰 기반)
  - 일회용 (사용 후 무효화)
  - 암호화된 이메일 정보 포함

### 패스워드 정책
- **최소 길이**: 8자 이상
- **복잡성**: 영문, 숫자 조합 권장
- **저장**: bcrypt 해싱 (백엔드)
- **전송**: HTTPS 암호화

### 보안 헤더
- **CORS**: 허용된 도메인만 접근
- **CSP**: Content Security Policy 적용
- **HTTPS**: 모든 통신 암호화
- **SameSite**: 쿠키 CSRF 방지

## 🎨 UI/UX 요구사항

### 디자인 원칙
- **일관성**: 기존 디자인 시스템 (Radix + Tailwind) 준수
- **접근성**: WCAG 2.1 AA 수준 (스크린 리더, 키보드 네비게이션)
- **반응형**: 모바일 퍼스트 (320px~)
- **다국어**: 한국어 우선, 영어 지원 계획
- **단순함 우선**: 의미없는 추상화 지양, 직관적이고 명확한 구조
- **시맨틱 HTML**: form 태그 및 submit 패턴 사용 금지, div 기반 구조로 구현하여 가독성 향상

### 페이지 구성

#### 1. 로그인 페이지 (`/sign-in`)
```
📱 모바일 중심 레이아웃
┌─────────────────┐
│   로고/제목      │
│                │
│ [이메일 입력]   │
│ [비밀번호 입력] │
│                │
│ "비밀번호 찾기"  │
│                │
│ [로그인 버튼]   │
│                │
│ ─── 또는 ───    │
│                │
│ [Google 로그인] │
│                │
│ 계정이 없나요?   │
│   회원가입      │
└─────────────────┘
```

#### 2. 회원가입 페이지 (`/sign-up`)
```
📱 단순한 이메일 입력
┌─────────────────┐
│     회원가입     │
│                │
│ 이메일을 입력하면│
│ 인증 링크를     │
│ 보내드립니다    │
│                │
│ [이메일 입력]   │
│                │
│ [인증메일 발송] │
│                │
│ 이미 계정이     │
│ 있나요? 로그인   │
└─────────────────┘
```

#### 3. 인증 대기 페이지 (`/sign-up/complete`)
```
📱 안내 및 재발송
┌─────────────────┐
│   ✉️ 이메일    │
│    확인하기     │
│                │
│ email@example   │
│ .com으로 인증   │
│ 링크를 보냈어요 │
│                │
│ 메일이 안 왔나요?│
│ [재발송하기]    │
│                │
│ [다른 이메일로] │
└─────────────────┘
```

#### 4. 등록 완료 페이지 (`/complete-registration?token=xxx`)
```
📱 개인정보 입력
┌─────────────────┐
│   거의 다 됐어요! │
│                │
│ [이메일] (비활성)│
│ [이름 입력]     │
│ [비밀번호]      │
│ [비밀번호 확인] │
│                │
│ [가입완료]      │
└─────────────────┘
```

#### 5. 패스워드 리셋 페이지 (`/reset-password`)
```
📱 이메일 입력
┌─────────────────┐
│  비밀번호 찾기   │
│                │
│ 계정 이메일을   │
│ 입력해주세요    │
│                │
│ [이메일 입력]   │
│                │
│ [리셋링크 발송] │
│                │
│ [로그인으로]    │
└─────────────────┘
```

#### 6. 패스워드 재설정 페이지 (`/reset-password/confirm?token=xxx`)
```
📱 새 비밀번호
┌─────────────────┐
│ 새 비밀번호 설정 │
│                │
│ [새 비밀번호]   │
│ [비밀번호 확인] │
│                │
│ [설정 완료]     │
└─────────────────┘
```

### 인터랙션 및 피드백

#### 로딩 상태
- **버튼**: 로딩 스피너 + 텍스트 변경 ("로그인 중...")
- **페이지**: 전체 로딩 오버레이 (인증 확인 시)
- **토큰 갱신**: 백그라운드 (사용자 인지 불가)

#### 성공 피드백
- **회원가입**: "인증 메일을 확인해주세요" 페이지로 이동
- **로그인**: 워크스페이스로 자동 이동
- **패스워드 리셋**: "새로운 비밀번호로 로그인해주세요" 메시지

#### 에러 피드백
- **폼 에러**: 입력 필드 하단에 빨간색 메시지
- **API 에러**: 페이지 상단에 알림 배너
- **네트워크 에러**: 재시도 버튼 포함 에러 메시지

## 📡 API 명세

### 인증 엔드포인트

#### 1. 이메일/비밀번호 로그인
```typescript
POST /v1/user/sign-in
Content-Type: application/json

// 요청
interface EmailPasswordSignInRequest {
  email: string;
  password: string;
}

// 응답
interface AuthSuccessResponse {
  message: string;
  user: User;
  access_token: string;
}
```

#### 2. Google OAuth 로그인
```typescript
POST /v1/user/google
Content-Type: application/json

// 요청
interface GoogleSignInRequest {
  access_token: string; // Google OAuth access token
}

// 응답: AuthSuccessResponse와 동일
```

#### 3. 토큰 갱신
```typescript
POST /v1/user/refresh
Cookie: refresh_token=xxx

// 응답
interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}
```

### 회원가입 엔드포인트

#### 1. 이메일 등록 (1단계)
```typescript
POST /v1/user/register-email
Content-Type: application/json

// 요청
interface RegisterEmailRequest {
  email: string;
}

// 응답
interface RegisterEmailResponse {
  message: string;
  success: boolean;
}
```

#### 2. 등록 정보 조회 (토큰 검증)
```typescript
POST /v1/user/get-registration-info
Content-Type: application/json

// 요청
interface GetRegistrationInfoRequest {
  token: string;
}

// 응답
interface GetRegistrationInfoResponse {
  email: string;
  success: boolean;
}
```

#### 3. 등록 완료 (2단계)
```typescript
POST /v1/user/complete-registration
Content-Type: application/json

// 요청
interface CompleteRegistrationRequest {
  token: string;
  name: string;
  password: string;
}

// 응답: AuthSuccessResponse와 동일 (자동 로그인)
```

### 패스워드 리셋 엔드포인트

#### 1. 리셋 요청
```typescript
POST /v1/user/reset-password
Content-Type: application/json

// 요청
interface ResetPasswordRequest {
  email: string;
}

// 응답
interface ResetPasswordResponse {
  message: string;
  success: boolean;
}
```

#### 2. 리셋 토큰 검증
```typescript
POST /v1/user/verify-reset-token
Content-Type: application/json

// 요청
interface VerifyResetTokenRequest {
  token: string;
}

// 응답
interface VerifyResetTokenResponse {
  email: string;
  success: boolean;
}
```

#### 3. 패스워드 재설정
```typescript
POST /v1/user/confirm-reset-password
Content-Type: application/json

// 요청
interface ConfirmResetPasswordRequest {
  token: string;
  password: string;
}

// 응답
interface ConfirmResetPasswordResponse {
  message: string;
  success: boolean;
}
```

### 기타 엔드포인트

#### 이메일 인증
```typescript
POST /v1/user/verify-email
Content-Type: application/json

// 요청
interface VerifyEmailRequest {
  token: string;
}

// 응답
interface VerifyEmailResponse {
  message: string;
  success: boolean;
}
```

#### 인증 메일 재발송
```typescript
POST /v1/user/resend-verification
Content-Type: application/json

// 요청
interface ResendVerificationRequest {
  email: string;
}

// 응답: ResendVerificationResponse와 동일
```

#### 로그아웃
```typescript
POST /v1/user/logout
Cookie: refresh_token=xxx

// 응답
interface LogoutResponse {
  message: string;
}
```

### 에러 응답 형식
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
}
```

## 🏗️ 구현 계획

### 코드 품질 원칙
- **의미있는 추상화만 유지**: 재사용성과 유지보수성을 위한 추상화만 구현
- **직접적인 상태 관리**: 불필요한 wrapper나 중간 레이어 없이 Zustand 직접 사용
- **Form 태그 및 Submit 패턴 금지**: 시맨틱 HTML 대신 div 기반 구조로 접근성 구현, 가독성 높은 onClick 핸들러 패턴 사용
- **명확한 책임 분리**: 각 컴포넌트와 훅의 역할을 명확히 정의

### Form-Free 구현 패턴
인증 시스템에서는 전통적인 HTML form 태그 대신 더 명확하고 가독성 높은 패턴을 사용합니다:

#### 기본 구조
```tsx
// ❌ 기존 form 패턴 (금지)
<form onSubmit={handleSubmit}>
  <input type="email" />
  <button type="submit">Sign In</button>
</form>

// ✅ 개선된 div 기반 패턴 (권장)
<div className="flex flex-col gap-6">
  <Input type="email" />
  <Button type="button" onClick={handleSignIn}>Sign In</Button>
</div>
```

#### 이벤트 핸들링
```tsx
// ❌ 기존 submit 핸들러 (금지)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // 로직
};

// ✅ 개선된 onClick 핸들러 (권장)
const handleSignIn = async () => {
  // 로직 (preventDefault 불필요)
};
```

#### 패턴의 장점
1. **가독성 향상**: form 관련 boilerplate 코드 제거로 핵심 로직에 집중
2. **명확한 의도**: 각 버튼의 동작이 함수명으로 명확히 표현
3. **단순한 구조**: preventDefault, FormEvent 등 불필요한 복잡성 제거
4. **일관성**: 모든 인증 페이지에서 동일한 패턴 적용
5. **유지보수성**: 더 직관적이고 예측 가능한 코드 구조

### Phase 1: 기반 구조 완성 (1-2일)
- [x] 기존 인증 시스템 분석 완료
- [x] Zustand 스토어 구조 완성
- [x] API 클라이언트 (axios) 구조 완성
- [x] 라우터 보호 컴포넌트 (ProtectedRoute) 완성
- [ ] **누락된 API 구현**: 현재 TODO로 남은 3개 API 호출 완료
- [ ] **패스워드 리셋 기능**: 새로운 페이지 및 API 구현

### Phase 2: 핵심 기능 완성 (2-3일)
- [ ] 회원가입 플로우 완전 구현
- [ ] 패스워드 리셋 플로우 구현
- [ ] 10분 토큰 만료 처리
- [ ] 에러 처리 강화
- [ ] 로딩 상태 개선

### Phase 3: 최적화 & 테스트 (1-2일)
- [ ] 접근성 개선 (ARIA, 키보드 네비게이션)
- [ ] 성능 최적화 (React.memo, useMemo)
- [ ] 에러 경계 컴포넌트 추가
- [ ] 사용자 피드백 개선

## ✅ 인수 기준 (Acceptance Criteria)

### 기능 테스트
- [ ] **회원가입 플로우**: 이메일 입력 → 인증 메일 → 정보 입력 → 자동 로그인
- [ ] **로그인**: 이메일/비밀번호 + Google OAuth 정상 동작
- [ ] **패스워드 리셋**: 이메일 → 리셋 메일 → 새 비밀번호 설정
- [ ] **토큰 관리**: 자동 갱신 및 만료 처리
- [ ] **보호 라우트**: 인증 상태에 따른 접근 제어

### 성능 테스트
- [ ] API 응답 시간 < 200ms
- [ ] 페이지 로딩 시간 < 2초
- [ ] 토큰 갱신 백그라운드 처리
- [ ] 메모리 누수 없음

### 보안 테스트
- [ ] JWT 토큰 만료 처리
- [ ] 인증 링크 10분 만료
- [ ] HTTPS 강제
- [ ] XSS/CSRF 방지

### 사용성 테스트
- [ ] 모바일 반응형 (320px~)
- [ ] 접근성 (WCAG 2.1 AA)
- [ ] 에러 메시지 명확성
- [ ] 로딩 상태 피드백

## 📊 현재 구현 상태

### ✅ 완료된 기능
- React + TypeScript + Zustand 기반 구조
- Google OAuth 통합 (`@react-oauth/google`)
- JWT 토큰 자동 관리 (axios interceptors)
- 보호 라우트 시스템 (`ProtectedRoute`)
- 기본 UI 컴포넌트 (Radix + Tailwind)
- 상태 관리 패턴 (custom hooks)

### 🔄 진행 중인 기능
- 이메일 인증 플로우 (일부 API 호출 TODO)
- 회원가입 완료 플로우 (토큰 검증 TODO)
- 에러 처리 개선

### ❌ 미구현 기능
- **패스워드 리셋 전체 플로우**
  - 리셋 요청 페이지 (`/reset-password`)
  - 리셋 확인 페이지 (`/reset-password/confirm`)
  - 관련 API 훅들 (`usePasswordReset`)
- **10분 토큰 만료 처리**
- **접근성 개선사항**

### 🐛 알려진 이슈
- ESLint 에러 2개: `useUserProfile.ts`의 `any` 타입 사용
- Fast refresh 경고 3개: UI 컴포넌트에서 상수/함수 export

## 📚 참고 자료

### 기존 구현 파일
- **페이지**: `src/pages/{sign-in,sign-up,complete-registration}/index.tsx`
- **훅**: `src/hooks/{useSignIn,useSignUp,useEmailVerification}.ts`
- **API**: `src/api/user/index.ts`
- **스토어**: `src/store/auth.ts`
- **라우터**: `src/App.tsx`

### 기술 문서
- [React Router v7 가이드](https://reactrouter.com/)
- [Zustand 패턴 가이드](https://github.com/pmndrs/zustand)
- [Radix UI 컴포넌트](https://www.radix-ui.com/)
- [Google OAuth 2.0](https://developers.google.com/identity/oauth2/web)

---

**검토자**: Development Team  
**승인자**: Product Manager  
**승인일**: 2025-01-29