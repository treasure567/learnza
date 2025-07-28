"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export type User = {
  email: string;
  name: string;
  emailVerifiedAt: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
    region: string;
  };
  accessibilityNeeds: {
    value: string;
    description: string;
    name: string;
  }[];
  preferences: {
    emailNotification: boolean;
    pushNotification: boolean;
    theme: "light" | "dark";
  };
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  getToken: () => string | null;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
};

// Cookie configuration
const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // Changed from 'strict' to 'lax' for better compatibility
  path: "/",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      getToken: () => Cookies.get(COOKIE_NAME) || null,

      setUser: (user) => set({ user }),

      login: (token, user) => {
        // Set token in HTTP-only cookie
        Cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
        // Update store with user data
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        // Remove token cookie
        Cookies.remove(COOKIE_NAME, { path: "/" });
        // Clear store
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: "auth-storage",
      // Only persist user data and authentication state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
