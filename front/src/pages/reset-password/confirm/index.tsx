import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { usePasswordReset } from "@/hooks/usePasswordReset";

export default function ConfirmResetPassword() {
  const { verifyResetToken, confirmReset, isLoading, error, clearError } = usePasswordReset();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchEmailFromToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setTokenError("Invalid reset link");
        return;
      }

      try {
        const result = await verifyResetToken({ token });
        if (result.success) {
          setEmail(result.email!);
          setIsTokenValid(true);
        } else {
          setTokenError(result.error || "Invalid or expired reset link");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setTokenError("Failed to verify reset link");
      }
    };

    if (searchParams.get('token')) {
      fetchEmailFromToken();
    }
  }, [searchParams, verifyResetToken]);

  const handleConfirmReset = async () => {
    clearError();
    setPasswordError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setTokenError("Invalid reset link");
      return;
    }

    const result = await confirmReset({
      token,
      password
    });

    if (result.success) {
      setIsCompleted(true);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-destructive">Invalid Link</h1>
            <p className="text-muted-foreground text-sm text-balance">
              {tokenError}
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/reset-password" className="block">
              <Button className="w-full">
                Request New Reset Link
              </Button>
            </Link>
            <Link to="/sign-in" className="block">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold">Verifying...</h1>
            <p className="text-muted-foreground text-sm">
              Please wait while we verify your reset link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Password updated</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>
          
          <Link to="/sign-in" className="block">
            <Button className="w-full">
              Continue to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentError = error || passwordError;

  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <div className={"flex flex-col gap-6"}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Set new password</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter a new password for your account
            </p>
          </div>
          
          {currentError && (
            <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md" role="alert">
              {currentError}
            </div>
          )}
          
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
              onClick={handleConfirmReset}
            >
              {isLoading ? "Updating password..." : "Update password"}
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