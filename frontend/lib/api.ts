import { useAuthStore } from "./store/auth";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  const { params, body, headers: customHeaders, ...rest } = options;

  // Build URL with query params
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Get auth token from store
  const token = useAuthStore.getState().token;

  // Prepare headers
  const headers = new Headers({
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...customHeaders,
  });

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  try {
    // Make the request
    const response = await fetch(url, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse the response
    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      // Handle 401 unauthorized
      if (response.status === 401) {
        // Clear auth state
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
      }
      throw new ApiError(response.status, data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Network error occurred");
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
