"use client";

import { ThemeProvider } from "../components/theme-provider";
import ThemeToggle from "../components/theme-toggle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen relative bg-light dark:bg-dark">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-[0.03]" />

          {/* Gradient Overlays */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-light/50 dark:to-dark/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary-dark/5 dark:via-secondary-dark/5 dark:to-accent-dark/5" />
          </div>

          {/* Animated Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 dark:bg-primary-dark/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-secondary/10 dark:bg-secondary-dark/10 rounded-full blur-3xl animate-pulse delay-300" />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle className="fixed top-4 right-4 z-50" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            {children}
          </div>
        </div>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
