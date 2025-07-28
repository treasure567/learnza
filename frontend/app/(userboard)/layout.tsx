"use client";

import ThemeToggle from "@/app/components/theme-toggle";
import { ThemeProvider } from "@/app/components/theme-provider";

export default function UserboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-light dark:bg-dark">
        {/* Fixed Theme Toggle */}
        <ThemeToggle className="fixed top-4 right-4 z-50" />

        {/* Main Content */}
        <main className="relative">{children}</main>
      </div>
    </ThemeProvider>
  );
}
