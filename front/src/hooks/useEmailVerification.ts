import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { api } from "../api";
import type {
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "../api/user";
import { isAxiosError } from "axios";

export interface UseEmailVerificationReturn {
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for email verification
 */
export const useEmailVerification = (
  redirectTo?: string
): UseEmailVerificationReturn => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const verifyEmailHandler = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: VerifyEmailRequest = { token };
        await api.user.verifyEmail(request);
        
        // Update user state on success
        if (user) {
          setUser({ ...user, is_verified: true, verified_at: new Date() });
        }
        
        if (redirectTo) {
          // Redirect on successful verification (optional)
          navigate(redirectTo, { replace: true });
        }

        return { success: true };
      } catch (err) {
        let errorMessage = "Email verification failed.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Email verification failed.";
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user, setUser, navigate, redirectTo]
  );

  const resendVerificationEmailHandler = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: ResendVerificationRequest = { email };
        await api.user.resendVerificationEmail(request);
        
        return { success: true };
      } catch (err) {
        let errorMessage = "Failed to resend verification email.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Failed to resend verification email.";
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    verifyEmail: verifyEmailHandler,
    resendVerificationEmail: resendVerificationEmailHandler,
    isLoading,
    error,
    clearError,
  };
};
