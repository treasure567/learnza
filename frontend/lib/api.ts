import { useAuthStore } from "./store/auth";

// Types
export type Language = {
  code: string;
  name: string;
  nativeName: string;
  region: string;
};

export type AccessibilityOption = {
  value: string;
  description: string;
  name: string;
};

export type UserPreferences = {
  email: string;
  name: string;
  emailVerifiedAt: string;
  language: Language;
  accessibilityNeeds: AccessibilityOption[];
  preferences: {
    emailNotification: boolean;
    pushNotification: boolean;
    theme: "light" | "dark";
  };
};

// API Response types
export type ApiResponse<T = any> = {
  status: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

// Custom fetch options type
type FetchOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string>;
  body?: Record<string, any>;
};

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  try {
    // Get token from auth store
    const token = useAuthStore.getState().getToken();

    // If no token and not a public endpoint, redirect to login
    if (!token && !endpoint.startsWith("/auth")) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/signin?from=${returnUrl}`;
      }
      throw new Error("Authentication required. Please login.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: "include",
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/signin?from=${returnUrl}`;
      }
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();

    // If the API indicates authentication error in the response
    if (!data.status && data.message?.toLowerCase().includes("unauthorized")) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/signin?from=${returnUrl}`;
      }
      throw new Error(
        data.message || "Authentication failed. Please login again."
      );
    }

    return data;
  } catch (error: any) {
    // If it's already a handled error, rethrow it
    if (error.message) {
      throw error;
    }
    // Handle network errors
    throw new Error("Network error. Please check your connection.");
  }
}

// Auth API
export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const response = await apiFetch<{ token: string; user: any }>(
      "/auth/login",
      {
        method: "POST",
        body: data,
      }
    );

    if (response.data) {
      useAuthStore.getState().login(response.data.token, response.data.user);
    }

    return response;
  },

  register: async (data: { email: string; name: string; password: string }) => {
    const response = await apiFetch<{ token: string; user: any }>(
      "/auth/register",
      {
        method: "POST",
        body: data,
      }
    );

    if (response.data) {
      useAuthStore.getState().login(response.data.token, response.data.user);
    }

    return response;
  },

  verifyEmail: (code: string) =>
    apiFetch<{ verified: boolean }>("/auth/verify-email", {
      method: "POST",
      body: { code },
    }),

  resendVerification: () =>
    apiFetch<{ sent: boolean }>("/auth/resend-verification", {
      method: "POST",
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ sent: boolean }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch<{ success: boolean }>("/auth/reset-password", {
      method: "POST",
      body: data,
    }),

  logout: () => {
    useAuthStore.getState().logout();
  },
};

// User API
export const userApi = {
  getProfile: () => apiFetch<UserPreferences>("/user/profile"),

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await apiFetch<{ user: any }>("/user/profile", {
      method: "PUT",
      body: data,
    });

    if (response.data?.user) {
      useAuthStore.getState().setUser(response.data.user);
    }

    return response;
  },

  updateLanguage: (data: { languageCode: string }) =>
    apiFetch<UserPreferences>("/user/update-language", {
      method: "PUT",
      body: data,
    }),

  updateAccessibility: (data: { accessibilityIds: string[] }) =>
    apiFetch<UserPreferences>("/user/update-accessibility", {
      method: "PUT",
      body: data,
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<null>("/user/change-password", {
      method: "PUT",
      body: data,
    }),

  updatePreferences: (data: UserPreferences["preferences"]) =>
    apiFetch<UserPreferences>("/user/update-preferences", {
      method: "PUT",
      body: data,
    }),
};

// Misc API
export const miscApi = {
  getLanguages: () => apiFetch<{ languages: Language[] }>("/misc/languages"),

  getAccessibilities: () =>
    apiFetch<{ accessibilities: AccessibilityOption[] }>(
      "/misc/accessibilities"
    ),
};

export const lessonsApi = {
  getLessons: (page = 1, limit = 10) =>
    apiFetch<PaginatedResponse<Lesson>>("/lessons", {
      params: { page: page.toString(), limit: limit.toString() },
    }),
};
