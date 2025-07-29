import { Route, Routes } from "react-router";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import SignUpComplete from "./pages/sign-up/complete";
import CompleteRegistration from "./pages/complete-registration";
import ResetPassword from "./pages/reset-password";
import ConfirmResetPassword from "./pages/reset-password/confirm";
import MainPage from "./pages";
import WorkspaceLayout from "./components/layout/WorkspaceLayout";
import WorkspaceMain from "./pages/workspace";
import WorkspaceChat from "./pages/workspace/chat";
import NotFound from "./pages/not-found";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { initializeStores } from "./store";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { api } from "./api";

function App() {
  useEffect(() => {
    const initAuth = async () => {
      // Initialize stores first
      initializeStores();
      
      // Check for stored token and load profile
      const token = localStorage.getItem('access_token');
      if (token) {
        const { setAccessToken, setUser, reset } = useAuthStore.getState();
        setAccessToken(token);
        
        try {
          // Try to load user profile
          const user = await api.user.getUserProfile();
          setUser(user);
        } catch (error) {
          // Token is invalid or expired
          console.error('Failed to load user profile:', error);
          localStorage.removeItem('access_token');
          reset();
        }
      }
    };
    
    initAuth();
  }, []);
  return (
    <AuthProvider>
      <Routes>
        {/* 루트 경로 - 메인 페이지 */}
        <Route index element={<MainPage />} />

        {/* 인증되지 않은 사용자만 접근 가능한 페이지들 */}
        <Route
          path="sign-in"
          element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          }
        />
        <Route path="sign-up">
          <Route
            index
            element={
              <ProtectedRoute requireAuth={false}>
                <SignUp />
              </ProtectedRoute>
            }
          />
          <Route
            path="complete"
            element={
              <ProtectedRoute requireAuth={false}>
                <SignUpComplete />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="complete-registration"
          element={
            <ProtectedRoute requireAuth={false}>
              <CompleteRegistration />
            </ProtectedRoute>
          }
        />
        <Route path="reset-password">
          <Route
            index
            element={
              <ProtectedRoute requireAuth={false}>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="confirm"
            element={
              <ProtectedRoute requireAuth={false}>
                <ConfirmResetPassword />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 인증된 사용자만 접근 가능한 페이지들 */}
        <Route
          path="workspace"
          element={
            <ProtectedRoute requireAuth={true}>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkspaceMain />} />
          <Route path="chat" element={<WorkspaceChat />} />
        </Route>

        {/* 404 Not Found - 모든 라우트의 마지막에 위치 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
