import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function NotFound() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleGoHome = () => {
    navigate(isAuthenticated ? "/workspace" : "/", { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 큰 숫자 */}
        <div className="text-8xl font-bold text-muted-foreground/30">404</div>
        
        {/* 헤더 */}
        <h1 className="text-3xl font-bold">Page not found</h1>
        
        {/* 설명 */}
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. 
          The page might have been removed or the link might be broken.
        </p>
        
        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
        
        {/* 추가 도움말 */}
        <p className="text-sm text-muted-foreground pt-6">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}