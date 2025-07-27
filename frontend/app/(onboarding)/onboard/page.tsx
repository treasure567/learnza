"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/app/components/ui";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { miscApi, userApi } from "@/lib/api";

type Language = {
  label: string;
  value: string;
};

type Accessibility = {
  label: string;
  value: string;
};

export default function OnboardPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [accessibilities, setAccessibilities] = useState<Accessibility[]>([]);
  const [loading, setLoading] = useState(false);
  const { step, language, accessibilityIds, setStep, setLanguage, setAccessibilityIds } = useOnboardingStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [langRes, accRes] = await Promise.all([
          miscApi.getLanguages(),
          miscApi.getAccessibilities(),
        ]);

        if (langRes.data?.languages) {
          setLanguages(
            langRes.data.languages.map((lang: string) => ({
              label: lang,
              value: lang.toLowerCase(),
            }))
          );
        }

        if (accRes.data?.accessibilities) {
          setAccessibilities(
            accRes.data.accessibilities.map((acc: string) => ({
              label: acc,
              value: acc.toLowerCase(),
            }))
          );
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

  const handleAccessibilityToggle = (id: string) => {
    setAccessibilityIds(
      accessibilityIds.includes(id)
        ? accessibilityIds.filter((accId) => accId !== id)
        : [...accessibilityIds, id]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A202C] text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Learnza</h1>
          <p className="text-[#FFFFFF80]">Let's personalize your experience</p>
        </div>

        <div className="bg-[#283142] rounded-2xl p-6 shadow-xl space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full ${step === 1 ? "bg-primary" : "bg-[#FFFFFF29]"}`} />
            <div className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-primary" : "bg-[#FFFFFF29]"}`} />
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose your language</h2>
              <p className="text-[#FFFFFF80] text-sm">Select your preferred language for learning</p>
              <Select
                value={language}
                onChange={setLanguage}
                options={languages}
                placeholder="Select language"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Accessibility preferences</h2>
              <p className="text-[#FFFFFF80] text-sm">Select any accessibility features you need</p>
              <div className="space-y-3">
                {accessibilities.map((acc) => (
                  <button
                    key={acc.value}
                    onClick={() => handleAccessibilityToggle(acc.value)}
                    className={`w-full px-4 py-3 rounded-[12px] border text-left transition-colors ${
                      accessibilityIds.includes(acc.value)
                        ? "border-primary bg-primary/10 text-white"
                        : "border-[#FFFFFF29] text-[#FFFFFF80] hover:border-[#FFFFFF40]"
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-3 rounded-[12px] border border-[#FFFFFF29] text-white hover:bg-[#FFFFFF0A] transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 && !language}
              className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-colors ${
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