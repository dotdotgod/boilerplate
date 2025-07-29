import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import type { User } from "../api/user";

// ==================== 타입 정의 ====================

export interface AuthState {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  // 추가 상태들
  isInitialized: boolean;
  lastRefreshTime: number | null;
}

export interface AuthActions {
  // 순수 상태 관리 액션들
  setUser: (user: User | null) => void;
  setAuthenticatedUser: (user: User, accessToken: string) => void; // Used on successful sign in

  // 토큰 관리
  setAccessToken: (token: string | null) => void;
  getAccessToken: () => string | null;
  clearAccessToken: () => void;
  hasValidAccessToken: () => boolean;

  // 초기화 및 유틸리티
  initializeAuth: () => void; // initialize + checkAuthStatus 통합
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ==================== 초기 상태 ====================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isInitialized: false,
  lastRefreshTime: null,
};

// ==================== 스토어 생성 ====================

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ==================== 순수 상태 관리 액션들 ====================

      setUser: (user: User | null) => {
        set((state) => {
          state.user = user;
        });
      },

      setAuthenticatedUser: (user: User, accessToken: string) => {
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
          state.accessToken = accessToken;
          state.lastRefreshTime = Date.now();
        });
        // Save token to localStorage
        localStorage.setItem('access_token', accessToken);
      },

      // ==================== 토큰 관리 액션들 ====================

      setAccessToken: (token: string | null) => {
        set((state) => {
          state.accessToken = token;
        });
        // Update localStorage
        if (token) {
          localStorage.setItem('access_token', token);
        } else {
          localStorage.removeItem('access_token');
        }
      },

      getAccessToken: () => {
        return get().accessToken;
      },

      clearAccessToken: () => {
        set((state) => {
          state.accessToken = null;
        });
      },

      hasValidAccessToken: () => {
        return !!get().accessToken;
      },

      reset: () => {
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.accessToken = null;
          state.lastRefreshTime = null;
        });
        // Clear localStorage
        localStorage.removeItem('access_token');
      },

      initializeAuth: () => {
        // Check localStorage for token
        const storedToken = localStorage.getItem('access_token');
        if (storedToken && !get().accessToken) {
          set((state) => {
            state.accessToken = storedToken;
          });
        }

        const hasToken = !!get().accessToken;

        set((state) => {
          state.isAuthenticated = hasToken;
          state.isInitialized = true;
          if (!hasToken) {
            state.user = null;
          }
        });

        return hasToken;
      },
    }))
  )
);
