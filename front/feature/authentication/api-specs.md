# 📡 Authentication API Specifications

인증 시스템의 상세한 API 명세서입니다. 모든 엔드포인트의 요청/응답 형식, 에러 코드, 보안 요구사항을 정의합니다.

## 🌐 API 기본 정보

### Base URL
```
개발환경: http://localhost:3000/v1
프로덕션: https://api.yourapp.com/v1
```

### 공통 헤더
```http
Content-Type: application/json
Authorization: Bearer {access_token}  # 인증 필요 시
```

### 공통 응답 형식
```typescript
// 성공 응답
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

// 에러 응답
interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: any;
  };
}
```

## 🔐 인증 관련 API

### 1. 이메일/비밀번호 로그인

#### Endpoint
```http
POST /v1/user/sign-in
```

#### 요청
```typescript
interface EmailPasswordSignInRequest {
  email: string;          // 유효한 이메일 형식
  password: string;       // 최소 8자 이상
}
```

#### 응답
```typescript
// 성공 (200)
interface AuthSuccessResponse {
  message: string;        // "로그인에 성공했습니다"
  user: User;
  access_token: string;   // JWT, 15분 만료
}

interface User {
  uuid: string;
  id?: number;
  name: string;
  email: string;
  is_verified: boolean;
  verified_at?: Date;
}
```

#### 에러 응답
```typescript
// 401 Unauthorized
{
  success: false,
  message: "이메일 또는 비밀번호가 올바르지 않습니다",
  error: {
    code: "INVALID_CREDENTIALS"
  }
}

// 403 Forbidden - 이메일 미인증
{
  success: false,
  message: "이메일 인증이 필요합니다",
  error: {
    code: "EMAIL_NOT_VERIFIED",
    details: { email: "user@example.com" }
  }
}

// 429 Too Many Requests
{
  success: false,
  message: "너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요",
  error: {
    code: "RATE_LIMIT_EXCEEDED",
    details: { retry_after: 300 }  // 초 단위
  }
}
```

#### 구현 예시
```typescript
// src/api/user/index.ts
export const emailPasswordSignIn = async (
  request: EmailPasswordSignInRequest
): Promise<AuthSuccessResponse> => {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/user/sign-in",
    request
  );
  return response.data;
};

// src/hooks/useSignIn.ts 에서 사용
const signIn = useCallback(async (credentials) => {
  try {
    const response = await api.user.emailPasswordSignIn(credentials);
    setAuthenticatedUser(response.user, response.access_token);
    return { success: true };
  } catch (err) {
    // 에러 처리
  }
}, []);
```

### 2. Google OAuth 로그인

#### Endpoint
```http
POST /v1/user/google
```

#### 요청
```typescript
interface GoogleSignInRequest {
  access_token: string;   // Google OAuth access token
}
```

#### 응답
```typescript
// 성공 (200) - 기존 사용자
AuthSuccessResponse

// 성공 (201) - 신규 사용자 (자동 회원가입)
AuthSuccessResponse & {
  message: "Google 계정으로 가입이 완료되었습니다"
}
```

#### 에러 응답
```typescript
// 400 Bad Request - 잘못된 Google 토큰
{
  success: false,
  message: "유효하지 않은 Google 토큰입니다",
  error: {
    code: "INVALID_GOOGLE_TOKEN"
  }
}

// 409 Conflict - 이메일 이미 존재 (다른 방법으로 가입)
{
  success: false,
  message: "해당 이메일로 이미 가입된 계정이 있습니다",
  error: {
    code: "EMAIL_ALREADY_EXISTS",
    details: { 
      email: "user@gmail.com",
      signup_method: "email" 
    }
  }
}
```

### 3. 토큰 갱신

#### Endpoint
```http
POST /v1/user/refresh
```

#### 요청
```http
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIs...
```

#### 응답
```typescript
// 성공 (200)
interface RefreshTokenResponse {
  message: string;        // "토큰이 갱신되었습니다"
  accessToken: string;    // 새로운 access token
}

// 새로운 refresh token도 Set-Cookie로 전송됨 (rotation)
```

#### 에러 응답
```typescript
// 401 Unauthorized - 유효하지 않은 refresh token
{
  success: false,
  message: "인증이 필요합니다",
  error: {
    code: "INVALID_REFRESH_TOKEN"
  }
}

// 403 Forbidden - 만료된 refresh token
{
  success: false,
  message: "세션이 만료되었습니다. 다시 로그인해주세요",
  error: {
    code: "REFRESH_TOKEN_EXPIRED"
  }
}
```

#### 자동 토큰 갱신 구현
```typescript
// src/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        const response = await axios.post("/user/refresh", {}, {
          withCredentials: true
        });
        useAuthStore.getState().setAccessToken(response.data.accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().reset();
        window.location.href = "/";
      }
    }
  }
);
```

## 📧 회원가입 관련 API

### 1. 이메일 등록 (1단계)

#### Endpoint
```http
POST /v1/user/register-email
```

#### 요청
```typescript
interface RegisterEmailRequest {
  email: string;          // 유효한 이메일 형식
}
```

#### 응답
```typescript
// 성공 (200)
interface RegisterEmailResponse {
  message: string;        // "인증 메일을 발송했습니다"
  success: boolean;       // true
}
```

#### 에러 응답
```typescript
// 409 Conflict - 이미 가입된 이메일
{
  success: false,
  message: "이미 가입된 이메일입니다",
  error: {
    code: "EMAIL_ALREADY_EXISTS"
  }
}

// 429 Too Many Requests - 이메일 발송 제한
{
  success: false,
  message: "잠시 후 다시 시도해주세요",
  error: {
    code: "EMAIL_RATE_LIMIT",
    details: { retry_after: 60 }
  }
}
```

### 2. 등록 정보 조회 (토큰 검증)

#### Endpoint
```http
POST /v1/user/get-registration-info
```

#### 요청
```typescript
interface GetRegistrationInfoRequest {
  token: string;          // 이메일 링크의 JWT 토큰
}
```

#### 응답
```typescript
// 성공 (200)
interface GetRegistrationInfoResponse {
  email: string;          // 토큰에서 추출한 이메일
  success: boolean;       // true
}
```

#### 에러 응답
```typescript
// 400 Bad Request - 잘못된 토큰 형식
{
  success: false,
  message: "유효하지 않은 토큰입니다",
  error: {
    code: "INVALID_TOKEN_FORMAT"
  }
}

// 401 Unauthorized - 만료된 토큰 (10분)
{
  success: false,
  message: "인증 링크가 만료되었습니다",
  error: {
    code: "TOKEN_EXPIRED",
    details: { expired_at: "2025-01-29T10:10:00Z" }
  }
}

// 410 Gone - 이미 사용된 토큰
{
  success: false,
  message: "이미 사용된 인증 링크입니다",
  error: {
    code: "TOKEN_ALREADY_USED"
  }
}
```

### 3. 등록 완료 (2단계)

#### Endpoint
```http
POST /v1/user/complete-registration
```

#### 요청
```typescript
interface CompleteRegistrationRequest {
  token: string;          // 인증 토큰
  name: string;           // 사용자 이름 (2-50자)
  password: string;       // 비밀번호 (8자 이상)
}
```

#### 응답
```typescript
// 성공 (201) - 자동 로그인
interface CompleteRegistrationResponse {
  message: string;        // "회원가입이 완료되었습니다"
  user: User;
  access_token: string;
}
```

#### 에러 응답
```typescript
// 400 Bad Request - 유효성 검사 실패
{
  success: false,
  message: "입력값이 올바르지 않습니다",
  error: {
    code: "VALIDATION_ERROR",
    details: {
      name: "이름은 2자 이상 50자 이하로 입력해주세요",
      password: "비밀번호는 8자 이상이어야 합니다"
    }
  }
}

// 409 Conflict - 이미 가입 완료
{
  success: false,
  message: "이미 가입이 완료된 이메일입니다",
  error: {
    code: "REGISTRATION_ALREADY_COMPLETED"
  }
}
```

## 🔑 패스워드 리셋 API

### 1. 리셋 요청

#### Endpoint
```http
POST /v1/user/reset-password
```

#### 요청
```typescript
interface ResetPasswordRequest {
  email: string;          // 계정 이메일
}
```

#### 응답
```typescript
// 성공 (200) - 보안상 이메일 존재 여부와 관계없이 동일한 응답
interface ResetPasswordResponse {
  message: string;        // "패스워드 리셋 링크를 발송했습니다"
  success: boolean;       // true
}
```

#### 에러 응답
```typescript
// 429 Too Many Requests
{
  success: false,
  message: "잠시 후 다시 시도해주세요",
  error: {
    code: "RESET_RATE_LIMIT",
    details: { retry_after: 300 }
  }
}
```

### 2. 리셋 토큰 검증

#### Endpoint
```http
POST /v1/user/verify-reset-token
```

#### 요청
```typescript
interface VerifyResetTokenRequest {
  token: string;          // 리셋 링크의 JWT 토큰
}
```

#### 응답
```typescript
// 성공 (200)
interface VerifyResetTokenResponse {
  email: string;          // 토큰에서 추출한 이메일
  success: boolean;       // true
}
```

#### 에러 응답
```typescript
// 401 Unauthorized - 만료된 토큰
{
  success: false,
  message: "리셋 링크가 만료되었습니다",
  error: {
    code: "RESET_TOKEN_EXPIRED"
  }
}

// 410 Gone - 이미 사용된 토큰
{
  success: false,
  message: "이미 사용된 리셋 링크입니다",
  error: {
    code: "RESET_TOKEN_USED"
  }
}
```

### 3. 패스워드 재설정

#### Endpoint
```http
POST /v1/user/confirm-reset-password
```

#### 요청
```typescript
interface ConfirmResetPasswordRequest {
  token: string;          // 리셋 토큰
  password: string;       // 새로운 비밀번호 (8자 이상)
}
```

#### 응답
```typescript
// 성공 (200)
interface ConfirmResetPasswordResponse {
  message: string;        // "비밀번호가 변경되었습니다"
  success: boolean;       // true
}
```

#### 에러 응답
```typescript
// 400 Bad Request - 약한 비밀번호
{
  success: false,
  message: "비밀번호가 보안 요구사항을 충족하지 않습니다",
  error: {
    code: "WEAK_PASSWORD",
    details: {
      requirements: [
        "최소 8자 이상",
        "영문, 숫자 조합 권장"
      ]
    }
  }
}
```

## 🔍 기타 API

### 1. 이메일 인증

#### Endpoint
```http
POST /v1/user/verify-email
```

#### 요청
```typescript
interface VerifyEmailRequest {
  token: string;          // 이메일 인증 토큰
}
```

#### 응답
```typescript
// 성공 (200)
interface VerifyEmailResponse {
  message: string;        // "이메일 인증이 완료되었습니다"
  success: boolean;       // true
}
```

### 2. 인증 메일 재발송

#### Endpoint
```http
POST /v1/user/resend-verification
```

#### 요청
```typescript
interface ResendVerificationRequest {
  email: string;          // 인증 메일을 받을 이메일
}
```

#### 응답
```typescript
// 성공 (200)
interface ResendVerificationResponse {
  message: string;        // "인증 메일을 재발송했습니다"
  success: boolean;       // true
}
```

### 3. 로그아웃

#### Endpoint
```http
POST /v1/user/logout
```

#### 요청
```http
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIs...
Authorization: Bearer {access_token}
```

#### 응답
```typescript
// 성공 (200)
interface LogoutResponse {
  message: string;        // "로그아웃되었습니다"
}

// refresh_token 쿠키 삭제됨
```

## 📊 HTTP 상태 코드 가이드

### 성공 응답
- **200 OK**: 일반적인 성공 응답
- **201 Created**: 새로운 리소스 생성 (회원가입 완료)

### 클라이언트 에러
- **400 Bad Request**: 요청 형식/데이터 오류
- **401 Unauthorized**: 인증 실패/토큰 만료
- **403 Forbidden**: 권한 없음/이메일 미인증
- **409 Conflict**: 데이터 충돌 (중복 이메일)
- **410 Gone**: 리소스 만료/사용됨 (토큰)
- **429 Too Many Requests**: 요청 횟수 제한

### 서버 에러
- **500 Internal Server Error**: 서버 내부 오류
- **502 Bad Gateway**: 외부 서비스 오류 (이메일 발송)
- **503 Service Unavailable**: 서비스 일시 중단

## 🔒 보안 고려사항

### 토큰 보안
```typescript
// JWT 토큰 구조
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "type": "access|refresh|verification|reset",
  "iat": 1643723400,
  "exp": 1643724300
}
```

### Rate Limiting
```typescript
// 엔드포인트별 제한
POST /user/sign-in: 5회/분
POST /user/register-email: 3회/시간
POST /user/resend-verification: 1회/분
POST /user/reset-password: 3회/시간
```

### CORS 설정
```javascript
// 허용된 도메인
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourapp.com'
];
```

## 🧪 테스트 시나리오

### API 테스트 케이스
```typescript
// 로그인 테스트
describe('POST /v1/user/sign-in', () => {
  test('유효한 자격증명으로 로그인 성공', async () => {
    const response = await request(app)
      .post('/v1/user/sign-in')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);
      
    expect(response.body.access_token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  test('잘못된 비밀번호로 로그인 실패', async () => {
    await request(app)
      .post('/v1/user/sign-in')
      .send({ email: 'test@example.com', password: 'wrong' })
      .expect(401);
  });
});
```

이 API 명세서를 통해 프론트엔드와 백엔드 팀이 일관된 인터페이스로 개발할 수 있습니다.