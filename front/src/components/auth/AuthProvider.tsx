import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 앱 시작 시 인증 상태를 초기화하는 컴포넌트
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 앱 시작 시 인증 상태 초기화
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}