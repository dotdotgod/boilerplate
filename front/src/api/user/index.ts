import { apiClient } from "../client";
import { useAuthStore } from "../../store/auth";

// ==================== 타입 정의 ====================

// 기본 사용자 타입
export interface User {
  uuid: string;
  id?: number;
  name: string;
  email: string;
  is_verified: boolean;
  verified_at?: Date;
}

// 인증 관련 요청 타입들
export interface GoogleSignInRequest {
  access_token: string;
}

export interface EmailPasswordSignInRequest {
  email: string;
  password: string;
}

export interface RegisterEmailRequest {
  email: string;
}

export interface GetRegistrationInfoRequest {
  token: string;
}

export interface CompleteRegistrationRequest {
  token: string;
  name: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

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

// 응답 타입들
export interface AuthSuccessResponse {
  message: string;
  user: User;
  access_token: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}

export interface RegisterEmailResponse {
  message: string;
  success: boolean;
}

export interface GetRegistrationInfoResponse {
  email: string;
  success: boolean;
}

export interface CompleteRegistrationResponse {
  message: string;
  user: User;
  access_token: string;
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
}

export interface ResendVerificationResponse {
  message: string;
  success: boolean;
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

export interface LogoutResponse {
  message: string;
}

// ==================== API 메소드들 ====================

/**
 * Google OAuth sign in
 */
export const googleSignIn = async (
  request: GoogleSignInRequest
): Promise<AuthSuccessResponse> => {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/user/google",
    request
  );

  return response.data;
};

/**
 * Email/password sign in
 */
export const emailPasswordSignIn = async (
  request: EmailPasswordSignInRequest
): Promise<AuthSuccessResponse> => {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/user/sign-in",
    request
  );

  return response.data;
};

/**
 * Token refresh
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>("/user/refresh");

  // 새로운 액세스 토큰을 메모리에 저장
  useAuthStore.getState().setAccessToken(response.data.accessToken);

  return response.data;
};

/**
 * Email registration (Step 1)
 */
export const registerEmail = async (
  request: RegisterEmailRequest
): Promise<RegisterEmailResponse> => {
  const response = await apiClient.post<RegisterEmailResponse>(
    "/user/register-email",
    request
  );

  return response.data;
};

/**
 * Get registration info
 */
export const getRegistrationInfo = async (
  request: GetRegistrationInfoRequest
): Promise<GetRegistrationInfoResponse> => {
  const response = await apiClient.post<GetRegistrationInfoResponse>(
    "/user/get-registration-info",
    request
  );

  return response.data;
};

/**
 * Complete registration (Step 2)
 */
export const completeRegistration = async (
  request: CompleteRegistrationRequest
): Promise<CompleteRegistrationResponse> => {
  const response = await apiClient.post<CompleteRegistrationResponse>(
    "/user/complete-registration",
    request
  );

  return response.data;
};

/**
 * Email verification
 */
export const verifyEmail = async (
  request: VerifyEmailRequest
): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<VerifyEmailResponse>(
    "/user/verify-email",
    request
  );

  return response.data;
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  request: ResendVerificationRequest
): Promise<ResendVerificationResponse> => {
  const response = await apiClient.post<ResendVerificationResponse>(
    "/user/resend-verification",
    request
  );

  return response.data;
};

/**
 * Logout
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>("/user/logout");

  return response.data;
};

/**
 * Password reset request
 */
export const resetPassword = async (
  request: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(
    "/user/reset-password",
    request
  );

  return response.data;
};

/**
 * Reset token verification
 */
export const verifyResetToken = async (
  request: VerifyResetTokenRequest
): Promise<VerifyResetTokenResponse> => {
  const response = await apiClient.post<VerifyResetTokenResponse>(
    "/user/verify-reset-token",
    request
  );

  return response.data;
};

/**
 * Confirm password reset
 */
export const confirmResetPassword = async (
  request: ConfirmResetPasswordRequest
): Promise<ConfirmResetPasswordResponse> => {
  const response = await apiClient.post<ConfirmResetPasswordResponse>(
    "/user/confirm-reset-password",
    request
  );

  return response.data;
};

/**
 * Get current user profile
 */
export const getUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>("/user/profile");

  return response.data;
};

// ==================== 유틸리티 함수들 ====================

/**
 * 모든 user API를 하나의 객체로 내보내기
 */
export const userApi = {
  googleSignIn,
  emailPasswordSignIn,
  refreshToken,
  registerEmail,
  getRegistrationInfo,
  completeRegistration,
  verifyEmail,
  resendVerificationEmail,
  logout,
  resetPassword,
  verifyResetToken,
  confirmResetPassword,
  getUserProfile,
};

export default userApi;
