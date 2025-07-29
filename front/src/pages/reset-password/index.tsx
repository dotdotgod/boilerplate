import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router";
import { usePasswordReset } from "@/hooks/usePasswordReset";

export default function ResetPassword() {
  const { requestReset, isLoading, error, clearError } = usePasswordReset();
  const [email, setEmail] = useState("");
  const [isRequested, setIsRequested] = useState(false);

  const handleRequestReset = async () => {
    clearError();

    const result = await requestReset({ email });
    if (result.success) {
      setIsRequested(true);
    }
  };

  if (isRequested) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsRequested(false)}
              className="w-full"
            >
              Try different email
            </Button>
            <Link to="/sign-in" className="block">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <div className={"flex flex-col gap-6"}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md" role="alert">
              {error}
            </div>
          )}
          
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="button" 
              className="w-full" 
              disabled={isLoading}
              onClick={handleRequestReset}
            >
              {isLoading ? "Sending reset link..." : "Send reset link"}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link to="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}