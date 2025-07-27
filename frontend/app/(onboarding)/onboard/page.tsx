"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/app/components/ui";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { miscApi, userApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  errors?: Record<string, string[]>;
};

type UserPreferences = {
  email: string;
  name: string;
  emailVerifiedAt: string;
  language: Language;
  accessibilityNeeds: AccessibilityOption[];
  preferences: {
    emailNotification: boolean;
    pushNotification: boolean;
    theme: string;
  };
};

const AccessibilityIcon = ({ selected }: { selected: boolean }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
      selected
        ? "bg-gradient-to-br from-primary to-primary-dark border-primary shadow-lg shadow-primary/20"
        : "border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-primary/50 dark:hover:border-primary-dark/50"
    }`}
  >
    <AnimatePresence>
      {selected && (
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "backOut" }}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0.5 text-white"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}
    </AnimatePresence>
  </motion.div>
);

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => (
  <div className="flex items-center justify-center space-x-4 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div key={step} className="flex items-center">
        <motion.div
          animate={{
            backgroundColor: step <= currentStep ? "#2A9D8F" : "transparent",
            borderColor: step <= currentStep ? "#2A9D8F" : "#E2E8F0",
            scale: step === currentStep ? 1.1 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            step <= currentStep
              ? "text-white shadow-lg"
              : "text-gray-400 dark:text-text-light/70"
          }`}
        >
          <motion.span
            animate={{ scale: step === currentStep ? 1.1 : 1 }}
            className="font-semibold text-sm"
          >
            {step}
          </motion.span>
        </motion.div>
        {step < totalSteps && (
          <motion.div
            animate={{
              backgroundColor: step < currentStep ? "#2A9D8F" : "#E2E8F0",
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-16 h-1 mx-2 rounded-full"
          />
        )}
      </div>
    ))}
  </div>
);

export default function OnboardPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [accessibilities, setAccessibilities] = useState<AccessibilityOption[]>(
    []
  );
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
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
              label: `${lang.name} (${lang.nativeName}) - ${lang.region}`,
            }))
          );
        }

        if (accRes.data?.accessibilities) {
          setAccessibilities(accRes.data.accessibilities);
        }
      } catch (error) {
        console.error("Failed to fetch onboarding data:", error);
        toast.error("Failed to load onboarding data. Please try again.");
      }
    };

    fetchData();
  }, []);

  const handleLanguageSubmit = async () => {
    if (!language) return;

    setSavingLanguage(true);
    try {
      const response = await userApi.updateLanguage({ languageCode: language });

      if (!response.status) {
        if (response.errors?.languageCode) {
          toast.error(response.errors.languageCode[0]);
        } else {
          toast.error(response.message || "Failed to save language preference");
        }
        return;
      }

      toast.success(response.message);
      setStep(2);
    } catch (error: any) {
      console.error("Failed to save language:", error);
      toast.error(error.message || "Failed to save language preference");
    } finally {
      setSavingLanguage(false);
    }
  };

  const handleAccessibilitySubmit = async () => {
    setSavingPreferences(true);
    try {
      const response = await userApi.updateAccessibility({
        settings: { accessibilityIds },
      });

      if (!response.status) {
        toast.error(
          response.message || "Failed to save accessibility preferences"
        );
        return;
      }

      toast.success(response.message);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to save accessibility preferences:", error);
      toast.error(error.message || "Failed to save accessibility preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
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
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/20"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-accent bg-clip-text text-transparent"
          >
            Welcome to Learnza
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-text-light/70 max-w-md mx-auto"
          >
            Let's personalize your learning experience with a few quick
            questions
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleSkip}
            className="text-gray-500 hover:text-primary dark:text-text-light/70 dark:hover:text-primary-dark transition-colors"
          >
            Skip for now
          </motion.button>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={2} />

        {/* Main Card */}
        <motion.div
          layout
          className="relative bg-white dark:bg-dark-surface backdrop-blur-xl border border-gray-100 dark:border-dark-border/50 rounded-3xl p-8 shadow-xl"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary-dark/5 dark:to-accent-dark/5 rounded-3xl" />

          <div className="relative">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="language"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-light">
                      Choose your language
                    </h2>
                    <p className="text-gray-600 dark:text-text-light/70 text-lg">
                      Select your preferred language for the best learning
                      experience
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Select
                      value={language}
                      onChange={setLanguage}
                      options={languages}
                      placeholder="Select your language"
                      className="text-lg"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="accessibility"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-light">
                      Accessibility preferences
                    </h2>
                    <p className="text-gray-600 dark:text-text-light/70 text-lg">
                      Help us make learning accessible for you
                    </p>
                  </div>

                  <div className="grid gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {accessibilities.map((acc, index) => (
                      <motion.button
                        key={acc.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAccessibilityToggle(acc.value)}
                        className={`group p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                          accessibilityIds.includes(acc.value)
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 dark:border-primary-dark dark:bg-primary-dark/5"
                            : "border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-primary/30 dark:hover:border-primary-dark/30 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <AccessibilityIcon
                            selected={accessibilityIds.includes(acc.value)}
                          />
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-light group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                              {acc.name}
                            </h3>
                            <p className="text-gray-600 dark:text-text-light/70 leading-relaxed">
                              {acc.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary-dark/5 dark:to-accent-dark/5 border border-primary/10 dark:border-primary-dark/10"
                  >
                    <p className="text-gray-600 dark:text-text-light/70 font-medium">
                      {accessibilityIds.length === 0 ? (
                        "No accessibility features selected"
                      ) : (
                        <>
                          <span className="text-primary dark:text-primary-dark font-bold">
                            {accessibilityIds.length}
                          </span>{" "}
                          feature{accessibilityIds.length === 1 ? "" : "s"}{" "}
                          selected
                        </>
                      )}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              layout
              className="flex gap-4 pt-8 mt-8 border-t border-gray-100 dark:border-dark-border/50"
            >
              <AnimatePresence>
                {step === 2 && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 dark:border-dark-border text-gray-700 dark:text-light font-semibold hover:border-primary/30 dark:hover:border-primary-dark/30 hover:bg-gray-50 dark:hover:bg-dark-100 transition-all duration-300"
                  >
                    Back
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={
                  step === 1 ? handleLanguageSubmit : handleAccessibilitySubmit
                }
                disabled={
                  (step === 1 && !language) ||
                  savingLanguage ||
                  savingPreferences
                }
                className={`${
                  step === 2 ? "flex-1" : "w-full"
                } px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  savingLanguage ||
                  savingPreferences ||
                  (step === 1 && !language)
                    ? "bg-gray-100 dark:bg-primary-dark/50 cursor-not-allowed text-gray-400 dark:text-white/70"
                    : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                }`}
              >
                {savingLanguage || savingPreferences ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </div>
                ) : step === 1 ? (
                  "Continue"
                ) : (
                  "Complete Setup"
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
