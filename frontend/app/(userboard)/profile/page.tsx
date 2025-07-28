"use client";

import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { miscApi, userApi } from "@/lib/api";
import { useTheme } from "@/app/components/theme-provider";
import { Button, Input, Select } from "@/app/components/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { ApiResponse, UserPreferences } from "@/lib/api";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export default function ProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({});

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: userApi.getProfile,
  });

  // Fetch languages and accessibility options
  const { data: languagesData } = useQuery({
    queryKey: ["languages"],
    queryFn: miscApi.getLanguages,
  });

  const { data: accessibilitiesData } = useQuery({
    queryKey: ["accessibilities"],
    queryFn: miscApi.getAccessibilities,
  });

  // Mutations
  const { mutate: updateLanguage, isPending: isUpdatingLanguage } = useMutation(
    {
      mutationFn: userApi.updateLanguage,
      onSuccess: (response) => {
        if (response.status) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: Error) => toast.error(error.message),
    }
  );

  const { mutate: updateAccessibility, isPending: isUpdatingAccessibility } =
    useMutation({
      mutationFn: userApi.updateAccessibility,
      onSuccess: (response) => {
        if (response.status) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: Error) => toast.error(error.message),
    });

  const { mutate: updatePreferences, isPending: isUpdatingPreferences } =
    useMutation({
      mutationFn: userApi.updatePreferences,
      onSuccess: (response: ApiResponse<UserPreferences>) => {
        if (response.status) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: Error) => toast.error(error.message),
    });

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: userApi.changePassword,
      onSuccess: (response: ApiResponse<null>) => {
        if (response.status) {
          toast.success(response.message);
          setPasswordForm({ currentPassword: "", newPassword: "" });
          setPasswordErrors({});
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: Error) => toast.error(error.message),
    }
  );

  const handlePasswordChange = () => {
    try {
      passwordSchema.parse(passwordForm);
      setPasswordErrors({});
      changePassword(passwordForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce(
          (acc, err) => ({
            ...acc,
            [err.path[0]]: err.message,
          }),
          {}
        );
        setPasswordErrors(errors);
      }
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    updateLanguage({ languageCode });
  };

  const handleAccessibilityToggle = (value: string) => {
    const currentNeeds = profile?.data?.accessibilityNeeds || [];
    const isSelected = currentNeeds.some((need) => need.value === value);
    const newNeeds = isSelected
      ? currentNeeds.filter((need) => need.value !== value)
      : [
          ...currentNeeds,
          accessibilitiesData?.data?.accessibilities.find(
            (acc) => acc.value === value
          )!,
        ];

    updateAccessibility({
      accessibilityIds: newNeeds.map((need) => need.value),
    });
  };

  const handlePreferencesChange = (
    key: keyof UserPreferences["preferences"],
    value: boolean | string
  ) => {
    if (!profile?.data?.preferences) return;

    updatePreferences({
      ...profile.data.preferences,
      [key]: value,
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Info Section */}
        <section className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Profile Information
            </h2>
            <Button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              variant="secondary"
            >
              {isEditingProfile ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  value={profile?.data?.email || ""}
                  disabled
                  className="bg-gray-50 dark:bg-dark-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <Input
                  value={profile?.data?.name || ""}
                  disabled={!isEditingProfile}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Language Preference
          </h2>
          <div className="max-w-md">
            <Select
              value={profile?.data?.language?.code}
              onChange={handleLanguageChange}
              options={
                languagesData?.data?.languages.map((lang) => ({
                  value: lang.code,
                  label: `${lang.name} (${lang.nativeName}) - ${lang.region}`,
                })) || []
              }
              placeholder="Select your preferred language"
            />
          </div>
        </section>

        {/* Accessibility Section */}
        <section className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Accessibility Settings
          </h2>
          <div className="grid gap-4">
            {accessibilitiesData?.data?.accessibilities.map((option) => {
              const isSelected = profile?.data?.accessibilityNeeds.some(
                (need) => need.value === option.value
              );

              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleAccessibilityToggle(option.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 dark:border-primary-dark dark:bg-primary-dark/5"
                      : "border-gray-100 dark:border-dark-border hover:border-primary/30 dark:hover:border-primary-dark/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark text-white"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {option.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Receive updates and announcements via email
                </p>
              </div>
              <button
                onClick={() =>
                  handlePreferencesChange(
                    "emailNotification",
                    !profile?.data?.preferences.emailNotification
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile?.data?.preferences.emailNotification
                    ? "bg-primary dark:bg-primary-dark"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile?.data?.preferences.emailNotification
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Push Notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Get real-time updates in your browser
                </p>
              </div>
              <button
                onClick={() =>
                  handlePreferencesChange(
                    "pushNotification",
                    !profile?.data?.preferences.pushNotification
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile?.data?.preferences.pushNotification
                    ? "bg-primary dark:bg-primary-dark"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile?.data?.preferences.pushNotification
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Change Password Section */}
        <section className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Change Password
          </h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                error={passwordErrors.currentPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                error={passwordErrors.newPassword}
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              loading={isChangingPassword}
              disabled={
                !passwordForm.currentPassword || !passwordForm.newPassword
              }
              className="w-full"
            >
              Change Password
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
