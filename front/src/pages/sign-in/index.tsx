import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleLogin } from "@react-oauth/google";
import { Link } from "react-router";
import { useState } from "react";
import { useSignIn } from "@/hooks/useSignIn";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";

export default function SignIn() {
  const { signIn, isLoading, error, clearError } = useSignIn("/workspace");
  const { googleSignIn, isLoading: googleLoading, error: googleError, clearError: clearGoogleError } = useGoogleSignIn("/workspace");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await googleSignIn(tokenResponse.access_token);
    },
    onError: () => {
      // Google OAuth 오류는 useGoogleSignIn 훅에서 처리됨
    }
  });

  const handleSignIn = async () => {
    clearError();
    clearGoogleError();
    
    await signIn({ email, password });
  };

  const currentError = error || googleError;

  return (
    <div className="min-h-svh flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <div className={"flex flex-col gap-6"}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Sign in to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to sign in to your account
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
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || googleLoading}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/reset-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading || googleLoading}
              />
            </div>
            <Button 
              type="button" 
              className="w-full" 
              disabled={isLoading || googleLoading}
              onClick={handleSignIn}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => login()}
              disabled={isLoading || googleLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {googleLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
