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
  setLoading: (loading: boolean) => void;
};

// Cookie configuration
const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false, // Changed initial state to false

      getToken: () => Cookies.get(COOKIE_NAME) || null,

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: (token, user) => {
        Cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        Cookies.remove(COOKIE_NAME, { path: "/" });
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: false, // Always persist loading as false
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, ensure loading is false
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);
