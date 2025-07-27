"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Input } from "@/app/components/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      toast.success("Password reset instructions sent to your email");
      setEmail("");
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
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
            />
            <Button
              type="submit"
              loading={loading}
              disabled={!email || loading}
              className="w-full"
            >
              Send Reset Instructions
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
              className="text-sm"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
