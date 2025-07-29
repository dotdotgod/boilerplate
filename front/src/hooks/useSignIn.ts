import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { api } from "../api";
import type { EmailPasswordSignInRequest } from "../api/user";
import { isAxiosError } from "axios";

export interface UseSignInReturn {
  signIn: (
    credentials: EmailPasswordSignInRequest
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for email/password sign in
 */
export const useSignIn = (redirectTo?: string): UseSignInReturn => {
  const navigate = useNavigate();
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const signIn = useCallback(
    async (credentials: EmailPasswordSignInRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.user.emailPasswordSignIn(credentials);
        
        // Update state on success
        setAuthenticatedUser(response.user, response.access_token);
        
        // Redirect on successful sign in
        const destination = redirectTo || "/";
        navigate(destination, { replace: true });
        
        return { success: true };
      } catch (err) {
        let errorMessage = "Sign in failed.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Sign in failed.";
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthenticatedUser, navigate, redirectTo]
  );

  return {
    signIn,
    isLoading,
    error,
    clearError,
  };
};
