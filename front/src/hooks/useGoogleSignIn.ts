import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { api } from "../api";
import type { GoogleSignInRequest } from "../api/user";
import { isAxiosError } from "axios";

export interface UseGoogleSignInReturn {
  googleSignIn: (
    accessToken: string
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for Google OAuth sign in
 */
export const useGoogleSignIn = (redirectTo?: string): UseGoogleSignInReturn => {
  const navigate = useNavigate();
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const googleSignInHandler = useCallback(
    async (accessToken: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: GoogleSignInRequest = {
          access_token: accessToken,
        };

        const response = await api.user.googleSignIn(request);
        
        // Update state on success
        setAuthenticatedUser(response.user, response.access_token);
        
        // Redirect on successful Google sign in
        const destination = redirectTo || "/";
        navigate(destination, { replace: true });
        
        return { success: true };
      } catch (err) {
        let errorMessage = "Google sign in failed.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Google sign in failed.";
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
    googleSignIn: googleSignInHandler,
    isLoading,
    error,
    clearError,
  };
};
