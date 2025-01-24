import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

// Password requirements schema
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const emailSchema = z.string().email("Please enter a valid email address");

// Rate limiting configuration
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

interface RateLimit {
  attempts: number;
  firstAttempt: number;
}

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get rate limit from localStorage
  const getRateLimit = (): RateLimit => {
    const stored = localStorage.getItem('authRateLimit');
    return stored ? JSON.parse(stored) : { attempts: 0, firstAttempt: Date.now() };
  };

  // Update rate limit in localStorage
  const updateRateLimit = (rateLimit: RateLimit) => {
    localStorage.setItem('authRateLimit', JSON.stringify(rateLimit));
  };

  // Reset rate limit
  const resetRateLimit = useCallback(() => {
    localStorage.removeItem('authRateLimit');
  }, []);

  // Check if rate limited
  const isRateLimited = useCallback(() => {
    const rateLimit = getRateLimit();
    const now = Date.now();

    // Reset if outside window
    if (now - rateLimit.firstAttempt > RATE_LIMIT_WINDOW) {
      resetRateLimit();
      return false;
    }

    return rateLimit.attempts >= RATE_LIMIT_ATTEMPTS;
  }, [resetRateLimit]);

  // Increment rate limit counter
  const incrementRateLimit = () => {
    const rateLimit = getRateLimit();
    const now = Date.now();

    // Reset if outside window
    if (now - rateLimit.firstAttempt > RATE_LIMIT_WINDOW) {
      updateRateLimit({ attempts: 1, firstAttempt: now });
      return;
    }

    updateRateLimit({
      attempts: rateLimit.attempts + 1,
      firstAttempt: rateLimit.firstAttempt
    });
  };

  // Validate input fields
  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }

    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    if (isRateLimited()) {
      const rateLimit = getRateLimit();
      const timeLeft = Math.ceil(
        (RATE_LIMIT_WINDOW - (Date.now() - rateLimit.firstAttempt)) / 1000 / 60
      );
      toast({
        title: "Too many attempts",
        description: `Please try again in ${timeLeft} minutes`,
        variant: "destructive",
      });
      return;
    }

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });

        // Reset rate limit on successful signup
        resetRateLimit();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Reset rate limit on successful login
        resetRateLimit();
        navigate("/");
      }
    } catch (error) {
      incrementRateLimit();
      
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when switching between login/signup
  useEffect(() => {
    setErrors({});
  }, [isSignUp]);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to start sharing your recipes"
              : "Sign in to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
                setConfirmPassword("");
              }}
              disabled={loading}
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;