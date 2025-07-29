// ==================== 스토어 통합 및 내보내기 ====================

export * from "./auth";

// 추가 스토어들이 생기면 여기에 export 추가
// export * from './user-preferences';
// export * from './app-state';

// ==================== 타입 재내보내기 ====================

export type { AuthState, AuthActions, AuthStore } from "./auth";

export type {
  User,
  GoogleSignInRequest,
  EmailPasswordSignInRequest,
  RegisterEmailRequest,
  GetRegistrationInfoRequest,
  CompleteRegistrationRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "../api/user";

// ==================== 유틸리티 함수들 ====================

import { useAuthStore } from "./auth";

/**
 * 모든 스토어의 상태를 초기화하는 함수
 */
export const initializeStores = () => {
  // 인증 스토어 초기화
  useAuthStore.getState().initializeAuth();

  // 추가 스토어 초기화가 필요한 경우 여기에 추가
};

/**
 * 모든 스토어를 리셋하는 함수 (로그아웃 시 사용)
 */
export const resetAllStores = async () => {
  // 인증 스토어 리셋
  await useAuthStore.getState().reset();

  // 추가 스토어 리셋이 필요한 경우 여기에 추가
};

/**
 * 개발 환경에서 스토어 상태를 콘솔에 출력하는 유틸리티
 */
export const logStoreStates = () => {
  if (process.env.NODE_ENV === "development") {
    console.group("🏪 Store States");
    console.log("Auth Store:", useAuthStore.getState());
    console.groupEnd();
  }
};
