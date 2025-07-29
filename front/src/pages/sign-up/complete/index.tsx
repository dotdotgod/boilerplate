import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { CheckCircle, Mail } from "lucide-react";

export default function SignUpComplete() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/sign-in");
  };

  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Verification email sent!</h1>
          </div>
          
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Please check your email</span>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="mb-2 font-medium text-foreground">Next steps:</p>
              <ol className="space-y-1 text-xs">
                <li>1. Check your email inbox</li>
                <li>2. Click the verification link in the email</li>
                <li>3. Complete your registration</li>
              </ol>
            </div>
            
            <p className="text-xs">
              Didn't receive the email? Check your spam folder or try again later.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/sign-up")}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}