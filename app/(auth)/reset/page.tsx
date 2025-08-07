"use client";

import { z } from "zod";
import { useState } from "react";
import { Button, Input } from "@/app/components/ui";
import { useForgotPassword, useResetPassword } from "@/lib/hooks/useAuth";
import { useSearchParams } from "next/navigation";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Forgot password state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { mutate: forgotPassword, isPending: isRequesting } = useForgotPassword();

  // Reset password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<{ password?: string; confirmPassword?: string }>({});
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse({ email });
      setEmailError("");
      forgotPassword(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
      }
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      passwordSchema.parse({ password, confirmPassword });
      setPasswordError({});
      resetPassword({ token, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errs: { password?: string; confirmPassword?: string } = {};
        for (const issue of err.errors) {
          const key = issue.path[0] as "password" | "confirmPassword";
          errs[key] = issue.message;
        }
        setPasswordError(errs);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 backdrop-blur-sm">
        {!token ? (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-dark dark:text-light">
                Reset Password
              </h1>
              <p className="text-text-muted dark:text-text-light/70">
                Enter your email address and we'll send you instructions to reset
                your password.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                error={emailError}
              />

              <Button
                type="submit"
                loading={isRequesting}
                disabled={!email || isRequesting}
                className="w-full"
              >
                Send Reset Instructions
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-dark dark:text-light">
                Create new password
              </h1>
              <p className="text-text-muted dark:text-text-light/70">
                Enter a new password and confirm it to finish resetting your account.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                error={passwordError.password}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                error={passwordError.confirmPassword}
              />

              <Button
                type="submit"
                loading={isResetting}
                disabled={!password || !confirmPassword || isResetting}
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
