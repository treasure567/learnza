import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccessibilitySettings = {
  highContrast?: boolean;
  fontSize?: "small" | "medium" | "large";
  reduceMotion?: boolean;
  screenReader?: boolean;
  signLanguage?: boolean;
  [key: string]: any;
};

type SettingsState = {
  language: string;
  accessibility: AccessibilitySettings;
  theme: "light" | "dark" | "system";
  // Actions
  setLanguage: (language: string) => void;
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  resetSettings: () => void;
};

const defaultSettings: Omit<
  SettingsState,
  keyof {
    setLanguage: any;
    setAccessibility: any;
    setTheme: any;
    resetSettings: any;
  }
> = {
  language: "en",
  accessibility: {
    highContrast: false,
    fontSize: "medium",
    reduceMotion: false,
    screenReader: false,
    signLanguage: false,
  },
  theme: "system",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setLanguage: (language) => set({ language }),

      setAccessibility: (settings) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            ...settings,
          },
        })),

      setTheme: (theme) => set({ theme }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "user-settings",
      // Only persist these fields
      partialize: (state) => ({
        language: state.language,
        accessibility: state.accessibility,
        theme: state.theme,
      }),
    }
  )
);
