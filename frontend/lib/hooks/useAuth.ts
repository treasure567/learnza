"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api";
import { useAuthStore } from "../store/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (!data.data?.user?.isEmailApproved) {
        router.push("/verify");
        return;
      }
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created! Please verify your email.");
      router.push("/verify");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      if (data.data?.verified) {
        toast.success("Email verified successfully!");
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: (data) => {
      if (data.data?.sent) {
        toast.success("Verification code resent to your email.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      if (data.data?.sent) {
        toast.success("Password reset instructions sent to your email.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success("Password reset successfully!");
        router.push("/signin");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    authApi.logout();
    logout();
    router.push("/signin");
  };
}
