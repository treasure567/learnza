import { create } from "zustand";

type OnboardingState = {
  step: number;
  language: string;
  accessibilityIds: string[];
  // Actions
  setStep: (step: number) => void;
  setLanguage: (language: string) => void;
  setAccessibilityIds: (ids: string[]) => void;
  reset: () => void;
};

const defaultState = {
  step: 1,
  language: "",
  accessibilityIds: [],
};

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  ...defaultState,

  setStep: (step) => set({ step }),
  setLanguage: (language) => set({ language }),
  setAccessibilityIds: (accessibilityIds) => set({ accessibilityIds }),
  reset: () => set(defaultState),
})); 