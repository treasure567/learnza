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
  address: string;
  emailVerifiedAt: string;
  language: Language;
  accessibilityNeeds: AccessibilityOption[];
  preferences: {
    emailNotification: boolean;
    pushNotification: boolean;
    theme: "light" | "dark";
  };
};

export type Task = {
  _id: string;
  title: string;
  description: string;
  category: "LESSON" | "CONTENT" | "STREAK";
  level: number;
  order: number;
  points: number;
  prerequisites: string[];
  requiredCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type TaskProgress = {
  task: Task;
  progress: number;
  remainingCount: number;
  isCompleted: boolean;
  earnedPoints: number;
};

export type TaskProgressResponse = {
  currentLevel: number;
  totalPoints: number;
  nextLevelPoints: number;
  progress: Array<{
    category: Task["category"];
    completed: number;
    required: number;
    remainingCount: number;
    potentialPoints: number;
  }>;
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
    process.env.NEXT_PUBLIC_API_URL || "https://api.learnza.net.ng/api";

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
    // Build URL with query params if provided
    const { params, body, ...restOptions } = options;
    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...restOptions.headers,
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // For auth endpoints, do not redirect. Let the caller handle error messaging.
      if (endpoint.startsWith("/auth")) {
        const data = (await response.json()) as ApiResponse<T>;
        return data;
      }
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

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiFetch<{ success: boolean, message: string }>("/user/change-password", {
      method: "PUT",
      body: data,
    });
    return response;
  },

  updateAddress: (data: { address: string }) =>
    apiFetch<UserPreferences>("/user/address", {
      method: "PUT",
      body: data,
    }),

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

  updatePreferences: (data: UserPreferences["preferences"]) =>
    apiFetch<UserPreferences>("/user/update-preferences", {
      method: "PUT",
      body: data,
    }),
};

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

  checkForGeneratingLessons: () =>
    apiFetch<Lesson[]>("/lessons/check-for-generating", {
      method: "GET",
    }),

  getLesson: (id: string) =>
    apiFetch<Lesson>("/lessons/" + id, {
      method: "GET",
    }),

  updateLessonLanguage: (id: string, languageCode: string) =>
    apiFetch<Lesson>("/lessons/update-language", {
      method: "PUT",
      body: { lessonId: id, languageCode },
    }),
};

// Tasks API
export const tasksApi = {
  getAvailableTasks: () =>
    apiFetch<TaskProgress[]>("/game/tasks/available"),
  getCompletedTasks: () =>
    apiFetch<TaskProgress[]>("/game/tasks/completed"),
  getTaskProgress: () =>
    apiFetch<TaskProgressResponse>("/game/tasks/progress")
};
