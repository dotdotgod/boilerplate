import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true면 인증 필요, false면 인증시 접근 불가
}

/**
 * 인증 상태에 따라 라우트 접근을 제어하는 컴포넌트
 *
 * @param requireAuth true: 인증된 사용자만 접근 가능 (workspace 등)
 *                   false: 인증되지 않은 사용자만 접근 가능 (sign-in, sign-up 등)
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // 초기화가 완료되지 않았으면 로딩 상태
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // 인증이 필요한 페이지인데 인증되지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // 인증되지 않은 사용자만 접근 가능한 페이지인데 인증된 경우
  if (!requireAuth && isAuthenticated) {
    // 원래 가려던 페이지가 있으면 그곳으로, 없으면 workspace로
    const from = location.state?.from?.pathname || "/workspace";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
