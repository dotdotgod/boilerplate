import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { api } from "../api";
import type {
  RegisterEmailRequest,
  GetRegistrationInfoRequest,
  CompleteRegistrationRequest,
} from "../api/user";
import { isAxiosError } from "axios";

export interface UseSignUpReturn {
  // Step 1: Email registration
  registerEmail: (
    request: RegisterEmailRequest
  ) => Promise<{ success: boolean; error?: string }>;

  // 토큰 검증 및 등록 정보 조회
  getRegistrationInfo: (
    request: GetRegistrationInfoRequest
  ) => Promise<{ success: boolean; email?: string; error?: string }>;

  // Step 2: Complete registration
  completeRegistration: (
    request: CompleteRegistrationRequest
  ) => Promise<{ success: boolean; error?: string }>;

  // 상태
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for sign up (2-step flow)
 */
export const useSignUp = (redirectTo?: string): UseSignUpReturn => {
  const navigate = useNavigate();
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const registerEmailHandler = useCallback(
    async (request: RegisterEmailRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await api.user.registerEmail(request);
        
        // Navigate to complete page on successful email registration
        navigate("/sign-up/complete", { replace: true });
        
        return { success: true };
      } catch (err) {
        let errorMessage = "Email registration failed.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Email registration failed.";
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const getRegistrationInfoHandler = useCallback(
    async (request: GetRegistrationInfoRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.user.getRegistrationInfo(request);
        return { success: true, email: response.email };
      } catch (err) {
        let errorMessage = "Failed to get registration info.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Failed to get registration info.";
        }
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const completeRegistrationHandler = useCallback(
    async (request: CompleteRegistrationRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.user.completeRegistration(request);
        
        // Update state on success
        setAuthenticatedUser(response.user, response.access_token);
        
        // Redirect on registration complete
        const destination = redirectTo || "/";
        navigate(destination, { replace: true });
        
        return { success: true };
      } catch (err) {
        let errorMessage = "Registration completion failed.";
        if (isAxiosError(err)) {
          errorMessage =
            err.response?.data?.message || "Registration completion failed.";
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
    registerEmail: registerEmailHandler,
    getRegistrationInfo: getRegistrationInfoHandler,
    completeRegistration: completeRegistrationHandler,
    isLoading,
    error,
    clearError,
  };
};
