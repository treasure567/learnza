"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setEmail(userData.email || "");
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      toast.error("Please enter the complete verification code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      toast.success("Email verified successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error((error as Error).message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      toast.success("Verification code resent to your email");
      setCode(["", "", "", "", "", ""]);
    } catch (error) {
      toast.error((error as Error).message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-text">
            Verify Your Email
          </h1>
          <p className="text-text/70">
            We've sent a verification code to
            <br />
            <span className="text-text font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-medium bg-dark text-light rounded-lg border border-text/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={code.join("").length !== 6 || loading}
            className="w-full"
          >
            Verify Email
          </Button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-text/70">
            Didn't receive the code?{" "}
            <Button
              variant="secondary"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-primary hover:text-primary-100 transition-colors"
            >
              Resend
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
