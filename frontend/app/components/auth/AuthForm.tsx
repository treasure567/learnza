"use client";

import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/app/components/ui";
import { useSearchParams } from "next/navigation";

interface FormData {
  email: string;
  password: string;
  name?: string;
}

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Props = {
  route: "register" | "login";
};

export default function AuthForm({ route }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleAuth = searchParams.get("google");

  // If googleAuth exist in params set in application and cookies storage
  useEffect(() => {
    if (!!googleAuth) {
      Cookies.set("token", googleAuth, { expires: 7 });
      localStorage.setItem("user", JSON.stringify(googleAuth));
      router.push("/dashboard");
    }
  }, [googleAuth, router]);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("No internet connection");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const validateForm = () => {
    if (route !== "register") return true;

    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<FormData> = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof FormData;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
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

    setLoading(true);
    setError(null);

    try {
      const payload =
        route === "login"
          ? {
              email: formData.email,
              password: formData.password,
            }
          : {
              email: formData.email,
              name: formData.name,
              password: formData.password,
            };

      const response = await fetch(`/api/auth/${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.status) {
        if (route === "register") {
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: data.data?.email,
              isEmailApproved: false,
            })
          );
          Cookies.set("token", data.data?.token, { expires: 7 });
          toast.success(
            "Account created! Please verify your email to continue"
          );
          router.push("/verify");
          return;
        }

        // For login, check email verification status
        if (!data.data?.isEmailApproved) {
          localStorage.setItem("user", JSON.stringify(data.data));
          Cookies.set("token", data.data?.token, { expires: 7 });
          toast.warning("Please verify your email to continue");
          router.push("/verify");
          return;
        }

        // Proceed with normal login for verified users
        Cookies.set("token", data.data?.token, { expires: 7 });
        localStorage.setItem("user", JSON.stringify(data.data));
        toast.success("Successfully logged in!");
        router.push("/dashboard");
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
      toast.error((err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
      setFormData({
        email: "",
        password: "",
        name: "",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isDisabled =
    route === "login"
      ? !formData.email || !formData.password
      : !formData.email || !formData.password || !formData.name;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[430px] mx-auto my-auto">
      <div className="space-y-2">
        <h3 className="text-3xl font-semibold text-text">
          {route === "register" ? "Create Account" : "Welcome Back"}
        </h3>
        <p className="text-text/70">
          {route === "register"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <Link
            href={route === "register" ? "/signin" : "/signup"}
            className="text-primary hover:text-primary-100 transition-colors"
          >
            {route === "register" ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {route === "register" && (
          <div>
            <Input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              onChange={handleChange}
              placeholder="Full Name"
              error={errors.name}
              value={formData.name}
            />
          </div>
        )}

        <div>
          <Input
            id="email"
            name="email"
            type="email"
            error={errors.email}
            onChange={handleChange}
            value={formData.email}
            placeholder="Email Address"
          />
        </div>

        <div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            error={errors.password}
          />
        </div>

        {route === "login" && (
          <div className="flex justify-end">
            <Link
              href="/reset"
              className="text-sm text-text hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={isDisabled}
          className="w-full"
        >
          {route === "register" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-text/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-light text-text/60">
            {route === "register" ? "Or register with" : "Or sign in with"}
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          // Implement Google Sign In
          toast.info("Google Sign In coming soon!");
        }}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}
