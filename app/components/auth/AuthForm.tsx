"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/app/components/ui";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import type { ApiResponse, UserPreferences } from "@/lib/api";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { z } from "zod";

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

const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {route === "register" && (
          <>
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
          </>
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
        {route === "register" && (
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              error={errors.confirmPassword}
            />
          </div>
        )}
        {route === "login" && (
          <div className="flex justify-end">
            <a
              href="/reset"
              className="text-sm text-primary dark:text-primary-dark hover:underline"
            >
              Forgot password?
            </a>
          </div>
        )}
        <Button
          type="submit"
          loading={isLoggingIn || isRegistering}
          disabled={
            !formData.email ||
            !formData.password ||
            (route === "register" && (!formData.name || !formData.confirmPassword))
          }
          className="w-full"
        >
          {route === "register" ? "Create Account" : "Sign In"}
        </Button>
      </form>


    </div>
  );
}
