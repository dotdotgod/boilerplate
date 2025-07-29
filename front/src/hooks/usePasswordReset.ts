import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../api";
import type {
  ResetPasswordRequest,
  VerifyResetTokenRequest,
  ConfirmResetPasswordRequest,
} from "../api/user";
import { isAxiosError } from "axios";

export interface UsePasswordResetReturn {
  // Step 1: Reset request
  requestReset: (
    request: ResetPasswordRequest
  ) => Promise<{ success: boolean; error?: string }>;

  // Step 2: Token verification
  verifyResetToken: (
    request: VerifyResetTokenRequest
  ) => Promise<{ success: boolean; email?: string; error?: string }>;

  // Step 3: Password reset
  confirmReset: (
    request: ConfirmResetPasswordRequest
  ) => Promise<{ success: boolean; error?: string }>;

  // 상태
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for password reset (3-step flow)
 */
export const usePasswordReset = (): UsePasswordResetReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const requestReset = useCallback(async (request: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.user.resetPassword(request);
      return { success: true };
    } catch (err) {
      let errorMessage = "Password reset request failed.";
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyResetToken = useCallback(
    async (request: VerifyResetTokenRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.user.verifyResetToken(request);
        return { success: true, email: response.email };
      } catch (err) {
        let errorMessage = "Reset link verification failed.";
        if (isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const confirmReset = useCallback(
    async (request: ConfirmResetPasswordRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await api.user.confirmResetPassword(request);
        
        // Redirect to sign in page on success
        navigate("/sign-in", { replace: true });
        
        return { success: true };
      } catch (err) {
        let errorMessage = "Password reset failed.";
        if (isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  return {
    requestReset,
    verifyResetToken,
    confirmReset,
    isLoading,
    error,
    clearError,
  };
};