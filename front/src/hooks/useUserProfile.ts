import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { api } from '../api';
import type { User } from '../api/user';
import { isAxiosError } from 'axios';

export interface UseUserProfileReturn {
  // 사용자 정보
  user: User | null;
  isAuthenticated: boolean;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션들
  refreshUserProfile: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // 유틸리티
  isEmailVerified: boolean;
  hasCompleteProfile: boolean;
}

/**
 * 사용자 프로필 관리를 위한 훅
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const reset = useAuthStore((state) => state.reset);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = () => setError(null);

  const refreshUserProfile = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 현재 토큰 상태를 확인하고 필요시 갱신
        await api.user.refreshToken();
        
        return { success: true };
      } catch (err: unknown) {
        let errorMessage = "Token refresh failed.";
        if (isAxiosError(err)) {
          errorMessage = err.response?.data?.message || "Token refresh failed.";
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateUserProfile = useCallback(
    (updates: Partial<User>) => {
      if (!user) return;
      
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      
      setUser(updatedUser);
    },
    [setUser, user]
  );

  const logout = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await api.user.logout();
      } catch (err: unknown) {
        console.warn("Server logout request failed:", err);
      } finally {
        reset(); // 상태 초기화
        setIsLoading(false);
      }
    },
    [reset]
  );

  // Check email verification status
  const isEmailVerified = user?.is_verified ?? false;

  // 프로필 완성도 확인 (필수 필드들이 모두 있는지)
  const hasCompleteProfile = Boolean(
    user && 
    user.name && 
    user.email && 
    user.uuid
  );

  return {
    // 사용자 정보
    user,
    isAuthenticated,
    
    // 상태
    isLoading,
    error,
    
    // 액션들
    refreshUserProfile,
    updateUserProfile,
    logout,
    clearError,
    
    // 유틸리티
    isEmailVerified,
    hasCompleteProfile,
  };
};