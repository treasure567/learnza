"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui";
import { useAuthStore } from "@/lib/store/auth";
import { useVerifyEmail, useResendVerification } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";

export default function VerifyEmailPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const { mutate: verify, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  // If already verified (after refresh), redirect quickly
  const { data: profile } = useQuery({
    queryKey: ["profile-for-verify"],
    queryFn: userApi.getProfile,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    const verified = profile?.data?.emailVerifiedAt;
    if (verified) {
      // keep store in sync then redirect
      if (profile?.data) setUser(profile.data as any);
      router.replace("/dashboard");
    }
  }, [profile, router, setUser]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");
    verify(verificationCode);
  };

  const handleResend = () => {
    resend();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-[430px]">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 backdrop-blur-sm shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-dark dark:text-light">
                Verify Your Email
              </h1>
              <p className="text-text-muted dark:text-text-light/70">
                We've sent a verification code to
                <br />
                <span className="text-dark dark:text-light font-medium">
                  {user?.email}
                </span>
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
                    className="w-12 h-12 text-center text-lg font-medium bg-light dark:bg-dark-surface text-dark dark:text-light rounded-lg border border-light-border dark:border-dark-border focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark outline-none transition-all"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>

              <Button
                type="submit"
                loading={isVerifying}
                disabled={code.join("").length !== 6 || isVerifying}
                className="w-full"
              >
                Verify Email
              </Button>
            </form>

            <div className="text-center space-y-4">
              <p className="text-text-muted dark:text-text-light/70">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary dark:text-primary-dark hover:text-primary-100 dark:hover:text-primary font-medium disabled:opacity-50 transition-colors"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
