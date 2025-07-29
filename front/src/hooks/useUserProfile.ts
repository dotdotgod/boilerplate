import { useCallback, useState } from "react";
import { useAuthStore } from "../store/auth";
import { api } from "../api";
import { isAxiosError } from "axios";

export interface UseUserProfileReturn {
  loadProfile: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for loading user profile
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const { setUser, reset } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await api.user.getUserProfile();
      setUser(user);
      return { success: true };
    } catch (err) {
      let errorMessage = "Failed to load profile";
      
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('access_token');
          reset();
          errorMessage = "Session expired. Please sign in again.";
        } else {
          errorMessage = err.response?.data?.message || "Failed to load profile";
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setUser, reset]);

  const logout = useCallback(async () => {
    try {
      await api.user.logout();
    } catch (err) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', err);
    } finally {
      reset();
    }
  }, [reset]);

  return {
    loadProfile,
    logout,
    isLoading,
    error,
  };
};