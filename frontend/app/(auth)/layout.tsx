"use client";

import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
            staleTime: 60 * 1000,
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
      <main className="min-h-screen w-full bg-white">
        {children}
      </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}