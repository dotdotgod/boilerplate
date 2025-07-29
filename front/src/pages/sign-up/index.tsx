import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router";
import { useSignUp } from "@/hooks/useSignUp";

export default function SignUp() {
  const { registerEmail, isLoading, error, clearError } = useSignUp();
  const [email, setEmail] = useState("");

  const handleRegisterEmail = async () => {
    clearError();
    
    await registerEmail({ email });
  };

  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <div className={"flex flex-col gap-6"}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email to receive a verification email
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
                placeholder="example@email.com"
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
              onClick={handleRegisterEmail}
            >
              {isLoading ? "Sending verification email..." : "Send Verification Email"}
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
