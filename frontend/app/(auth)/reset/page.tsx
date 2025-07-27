"use client";

import { useState } from "react";
import { Button, Input } from "@/app/components/ui";
import { useForgotPassword } from "@/lib/hooks/useAuth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      schema.parse({ email });
      setError("");
      forgotPassword(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 backdrop-blur-sm">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              error={error}
            />

            <Button
              type="submit"
              loading={isPending}
              disabled={!email || isPending}
              className="w-full"
            >
              Send Reset Instructions
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
