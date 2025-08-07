"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button, Input } from "@/app/components/ui";
import { ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import type { ApiResponse, UserPreferences } from "@/lib/api";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

type LoginCredentials = {
  email: string;
  password: string;
};

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});



export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (
      response: ApiResponse<{ user: UserPreferences; token: string }>
    ) => {
      if (response.status) {
        toast.success(response.message);
        const verified = !!response.data?.user?.emailVerifiedAt;
        if (!verified) {
          router.push("/verify");
          return;
        }
        // Get the redirect URL from searchParams or default to dashboard
        const redirectTo = searchParams.get("from") || "/dashboard";
        router.push(redirectTo);
        router.refresh(); // Refresh to update navigation state
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      // Show error toast and avoid extra refresh
      toast.error(error.message || "Invalid email or password");
    },
  });

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce(
          (acc, err) => ({
            ...acc,
            [err.path[0]]: err.message,
          }),
          {}
        );
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      toast.error("Please check your internet connection and try again");
      return;
    }
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    login({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Banner */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src="/images/auth-banner.jpg"
            alt="Education Banner"
            fill
            className="object-cover rounded-tr-[60px] rounded-br-[60px]"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-tr-[60px] rounded-br-[60px]" />

          {/* Logo Overlay */}
          <div className="absolute bottom-8 left-8 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Learnza Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-white font-semibold">Learnza</p>
                <p className="text-green-50/70 text-sm">Inclusive Learning Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900"
            >
              Sign in to your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Don't have an account?{" "}
              <Link href="/signup" className="text-green-700 hover:text-green-800 font-medium">
                Sign up
              </Link>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                error={errors.email}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                error={errors.password}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600/20"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm text-green-700 hover:text-green-800">
                Forgot password?
              </Link>
            </div>

            <Button
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              type="submit"
              onClick={(e) => handleSubmit(e)}
              loading={isLoggingIn}
              disabled={!formData.email || !formData.password}
              aria-live="polite"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
