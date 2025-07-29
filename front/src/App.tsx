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
import WorkspaceSessions from "./pages/workspace/sessions";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { initializeStores } from "./store";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    initializeStores();
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
          <Route path="sessions" element={<WorkspaceSessions />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
