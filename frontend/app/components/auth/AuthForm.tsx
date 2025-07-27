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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-dark dark:text-light">
          {route === "register" ? "Create an account" : "Welcome back"}
        </h2>
        <p className="text-text-muted dark:text-text-light/70">
          {route === "register" ? (
            <>
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary dark:text-primary-dark hover:text-primary-100 dark:hover:text-primary-300 font-medium"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary dark:text-primary-dark hover:text-primary-100 dark:hover:text-primary-300 font-medium"
              >
                Create account
              </Link>
            </>
          )}
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
              className="text-sm text-primary dark:text-primary-dark hover:text-primary-100 dark:hover:text-primary-300 font-medium"
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
          <div className="w-full border-t border-light-border dark:border-dark-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-light-surface dark:bg-dark-surface text-text-muted dark:text-text-light/70">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => {
          toast.info("Google Sign In coming soon!");
        }}
        className="w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-100 dark:hover:bg-dark-100 text-dark dark:text-light"
      >
        <svg
          className="w-5 h-5 mr-2 text-dark dark:text-light"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.766 12.2764c0-.9175-.07-1.7967-.2135-2.6451H12.24v4.9933h6.4558c-.2781 1.4976-1.1376 2.7745-2.4217 3.6222v3.0087h3.9197c2.2955-2.1137 3.6213-5.2167 3.6213-8.9791Z"
            fill="#4285F4"
          />
          <path
            d="M12.2401 24c3.2807 0 6.0255-1.0859 8.0321-2.9293l-3.9197-3.0087c-1.0858.7276-2.4748 1.1578-4.1124 1.1578-3.1617 0-5.8385-2.1345-6.7942-5.0019H1.3282v3.1052C3.3375 21.2443 7.4934 24 12.2401 24Z"
            fill="#34A853"
          />
          <path
            d="M5.4459 14.2178c-.2427-.7276-.3819-1.5034-.3819-2.3011s.1392-1.5735.3819-2.3011V6.5104H1.3282C.4781 8.2377 0 10.1591 0 12.1167c0 1.9577.4781 3.879 1.3282 5.6063l4.1177-3.5052Z"
            fill="#FBBC05"
          />
          <path
            d="M12.2401 4.8304c1.7858 0 3.3861.6123 4.6419 1.8145l3.4743-3.4743C18.2584 1.2287 15.5136 0 12.2401 0 7.4934 0 3.3375 2.7557 1.3282 6.5104l4.1177 3.1052c.9557-2.8674 3.6325-5.0019 6.7942-5.0019Z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}
