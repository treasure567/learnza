"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/app/components/ui";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { miscApi, userApi } from "@/lib/api";

type Language = {
  code: string;
  name: string;
  nativeName: string;
  region: string;
};

type LanguageOption = {
  label: string;
  value: string;
};

type AccessibilityOption = {
  value: string;
  description: string;
  name: string;
};

type ApiResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
};

const AccessibilityIcon = ({ selected }: { selected: boolean }) => (
  <div
    className={`shrink-0 w-5 h-5 rounded-md border-2 transition-colors ${
      selected
        ? "bg-primary border-primary"
        : "border-[#FFFFFF40] hover:border-[#FFFFFF60]"
    }`}
  >
    {selected && (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full p-0.5 text-white"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

export default function OnboardPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [accessibilities, setAccessibilities] = useState<AccessibilityOption[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const {
    step,
    language,
    accessibilityIds,
    setStep,
    setLanguage,
    setAccessibilityIds,
  } = useOnboardingStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [langRes, accRes] = await Promise.all([
          miscApi.getLanguages() as Promise<
            ApiResponse<{ languages: Language[] }>
          >,
          miscApi.getAccessibilities() as Promise<
            ApiResponse<{ accessibilities: AccessibilityOption[] }>
          >,
        ]);

        if (langRes.data?.languages) {
          setLanguages(
            langRes.data.languages.map((lang) => ({
              value: lang.code,
              label: lang.name,
            }))
          );
        }

        if (accRes.data?.accessibilities) {
          setAccessibilities(accRes.data.accessibilities);
        }
      } catch (error) {
        console.error("Failed to fetch onboarding data:", error);
      }
    };

    fetchData();
  }, []);

  const handleNext = async () => {
    if (step === 1 && language) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      try {
        await Promise.all([
          userApi.updateLanguage(language),
          userApi.updateAccessibility({ settings: { accessibilityIds } }),
        ]);
        router.push("/dashboard"); // Redirect to dashboard after onboarding
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleAccessibilityToggle = (value: string) => {
    setAccessibilityIds(
      accessibilityIds.includes(value)
        ? accessibilityIds.filter((accId) => accId !== value)
        : [...accessibilityIds, value]
    );
  };

  return (
    <div className="flex items-center justify-center text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl text-dark dark:text-light font-bold mb-2">
            Welcome to Learnza
          </h1>
          <p className="text-text-muted dark:text-text-light/70">
            Let's personalize your experience
          </p>
        </div>

        <div className="bg-[#283142] rounded-2xl p-6 shadow-xl space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            <div
              className={`h-1 flex-1 rounded-full ${
                step === 1 ? "bg-primary" : "bg-[#FFFFFF29]"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${
                step === 2 ? "bg-primary" : "bg-[#FFFFFF29]"
              }`}
            />
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose your language</h2>
              <p className="text-[#FFFFFF80] text-sm">
                Select your preferred language for learning
              </p>
              <Select
                value={language}
                onChange={setLanguage}
                options={languages}
                placeholder="Select language"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Accessibility preferences
                </h2>
                <p className="text-[#FFFFFF80] text-sm mt-1">
                  Select any accessibility features you need
                </p>
              </div>

              <div className="grid gap-3">
                {accessibilities.map((acc) => (
                  <button
                    key={acc.value}
                    onClick={() => handleAccessibilityToggle(acc.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all hover:border-[#FFFFFF40] ${
                      accessibilityIds.includes(acc.value)
                        ? "border-primary bg-primary/5"
                        : "border-[#FFFFFF29]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <AccessibilityIcon
                        selected={accessibilityIds.includes(acc.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{acc.name}</div>
                        <div className="text-sm text-[#FFFFFF80] mt-0.5">
                          {acc.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-sm text-[#FFFFFF80] mt-2 text-center">
                {accessibilityIds.length === 0
                  ? "No accessibility features selected"
                  : `${accessibilityIds.length} feature${
                      accessibilityIds.length === 1 ? "" : "s"
                    } selected`}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-3 rounded-xl border border-[#FFFFFF29] text-white hover:bg-[#FFFFFF0A] transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 && !language}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                loading
                  ? "bg-primary/50 cursor-not-allowed"
                  : step === 1 && !language
                  ? "bg-primary/50 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {loading ? "Saving..." : step === 1 ? "Next" : "Finish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
