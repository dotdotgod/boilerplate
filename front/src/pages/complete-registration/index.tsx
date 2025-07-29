import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useSignUp } from "@/hooks/useSignUp";

export default function CompleteRegistration() {
  const { getRegistrationInfo, completeRegistration, isLoading, error, clearError } = useSignUp("/workspace");
  const [searchParams] = useSearchParams();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchEmailFromToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setTokenError("Invalid verification link");
        return;
      }

      try {
        const result = await getRegistrationInfo({ token });
        if (result.success) {
          setEmail(result.email!);
          setIsTokenValid(true);
        } else {
          setTokenError(result.error || "Invalid or expired token");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setTokenError("Failed to verify token");
      }
    };

    if (searchParams.get('token')) {
      fetchEmailFromToken();
    }
  }, [searchParams, getRegistrationInfo]);

  const handleCompleteRegistration = async () => {
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
      setTokenError("Invalid verification link");
      return;
    }

    await completeRegistration({
      token,
      name: name.trim(),
      password
    });
  };

  if (tokenError) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xs text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Invalid Link
          </h1>
          <p className="text-muted-foreground mb-6">{tokenError}</p>
          <div className="space-y-3">
            <Link to="/sign-up" className="block">
              <Button className="w-full">
                Back to Sign Up
              </Button>
            </Link>
            <Link to="/sign-in" className="block">
              <Button variant="outline" className="w-full">
                Go to Sign In
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
          <h1 className="text-2xl font-bold mb-4">Verifying...</h1>
          <p className="text-muted-foreground">
            Please wait while we verify your link.
          </p>
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
            <h1 className="text-2xl font-bold">Complete Registration</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Set up your account with name and password
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                minLength={2}
                maxLength={50}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 8 characters)"
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
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={
                isLoading || !name.trim() || !password || !confirmPassword
              }
              onClick={handleCompleteRegistration}
            >
              {isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
