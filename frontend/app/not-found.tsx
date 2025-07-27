"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "./components/global/theme-provider";

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative bg-light dark:bg-dark">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-[0.03]" />

      {/* Large 404 Background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full"
        >
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold text-primary/5 dark:text-primary-dark/5">
            404
          </h2>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:from-primary-dark dark:via-secondary-dark dark:to-accent-dark">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-dark dark:text-light">
            Page Not Found
          </h2>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 dark:from-primary-dark/10 dark:via-secondary-dark/10 dark:to-accent-dark/10 blur-xl" />
          <p className="relative text-text-muted dark:text-text-light/70 max-w-md mx-auto px-6 py-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
            Oops! The page you're looking for seems to have wandered off into
            the digital wilderness. Let's get you back on track.
          </p>
        </div>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-primary mt-10 hover:bg-primary-dark text-light px-6 py-3 rounded-lg font-medium transition-colors dark:bg-primary-dark dark:hover:bg-primary"
          >
            Back to Home
          </motion.button>
        </Link>
      </motion.div>

      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => {
          const nextTheme = theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("dark");
        }}
        className="fixed top-4 right-4 p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-100 dark:hover:bg-dark-100 transition-colors"
      >
        {theme === "dark" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-primary-dark"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        )}
      </motion.button>
    </main>
  );
}
