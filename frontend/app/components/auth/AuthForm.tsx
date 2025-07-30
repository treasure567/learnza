"use client";

import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { Button, Input } from "@/app/components/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import type { ApiResponse, UserPreferences } from "@/lib/api";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterCredentials = LoginCredentials & {
  name: string;
};

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type AuthFormProps = {
  route: "register" | "login";
};

export default function AuthForm({ route }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (
      response: ApiResponse<{ user: UserPreferences; token: string }>
    ) => {
      if (response.status) {
        toast.success(response.message);
        // Get the redirect URL from searchParams or default to dashboard
        const redirectTo = searchParams.get("from") || "/dashboard";
        router.push(redirectTo);
        router.refresh(); // Refresh to update navigation state
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authApi.register(credentials),
    onSuccess: (
      response: ApiResponse<{ user: UserPreferences; token: string }>
    ) => {
      if (response.status) {
        toast.success(response.message);
        if (!response.data?.user?.emailVerifiedAt) {
          router.push("/verify");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const validateForm = () => {
    try {
      if (route === "login") {
        loginSchema.parse(formData);
      } else {
        registerSchema.parse(formData);
      }
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

    if (route === "login") {
      login({
        email: formData.email,
        password: formData.password,
      });
    } else {
      register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-c2xl font-bold tracking-tight text-text dark:text-text-light">
          {route === "register" ? "Create an account" : "Welcome back"}
        </h2>
        <p className="text-text-muted">
          {route === "register" ? (
            <>
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary dark:text-primary-dark hover:underline"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary dark:text-primary-dark hover:underline"
              >
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {route === "register" && (
          <div>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={errors.name}
            />
          </div>
        )}
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            error={errors.email}
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            error={errors.password}
          />
        </div>
        {route === "login" && (
          <div className="flex justify-end">
            <Link
              href="/reset"
              className="text-sm text-primary dark:text-primary-dark hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}
        <Button
          type="submit"
          loading={isLoggingIn || isRegistering}
          disabled={
            !formData.email ||
            !formData.password ||
            (route === "register" && !formData.name)
          }
          className="w-full"
        >
          {route === "register" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-light-border dark:border-dark-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-light-surface dark:bg-dark-surface text-text-muted">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => toast.info("Google Sign In coming soon!")}
        className="w-full"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}
