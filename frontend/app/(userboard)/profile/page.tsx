"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Select } from "@/app/components/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { miscApi, userApi } from "@/lib/api";
import type { ApiResponse, UserPreferences } from "@/lib/api";
import { z } from "zod";

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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({});

  // Get queryClient for cache updates
  const queryClient = useQueryClient();

  // Fetch data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: userApi.getProfile,
  });

  const { data: languagesData } = useQuery({
    queryKey: ["languages"],
    queryFn: miscApi.getLanguages,
  });

  const { data: accessibilitiesData } = useQuery({
    queryKey: ["accessibilities"],
    queryFn: miscApi.getAccessibilities,
  });

  // Mutations
  const { mutate: updateLanguage } = useMutation({
    mutationFn: userApi.updateLanguage,
    onSuccess: (response) => {
      toast.success(response.message);
      // Invalidate profile to get fresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: updateAccessibility } = useMutation({
    mutationFn: userApi.updateAccessibility,
    onSuccess: (response: ApiResponse<UserPreferences>) => {
      toast.success(response.message);
      // Update profile data immediately
      queryClient.setQueryData(
        ["profile"],
        (old: ApiResponse<UserPreferences> | undefined) => {
          if (!old?.data || !response.data?.accessibilityNeeds) return old;
          return {
            ...old,
            data: {
              ...old.data,
              accessibilityNeeds: response.data.accessibilityNeeds,
            },
          };
        }
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: updatePreferences } = useMutation({
    mutationFn: userApi.updatePreferences,
    onSuccess: (response: ApiResponse<UserPreferences>) => {
      toast.success(response.message);
      // Update profile data immediately
      queryClient.setQueryData(
        ["profile"],
        (old: ApiResponse<UserPreferences> | undefined) => {
          if (!old?.data || !response.data?.preferences) return old;
          return {
            ...old,
            data: {
              ...old.data,
              preferences: response.data.preferences,
            },
          };
        }
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: userApi.changePassword,
      onSuccess: (response) => {
        toast.success(response.message);
        setPasswordForm({ currentPassword: "", newPassword: "" });
        setPasswordErrors({});
      },
      onError: (error) => toast.error(error.message),
    }
  );

  // Handlers
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
    const newIds = isSelected
      ? currentNeeds
          .filter((need) => need.value !== value)
          .map((need) => need.value)
      : [...currentNeeds.map((need) => need.value), value];

    updateAccessibility({ accessibilityIds: newIds });
  };

  const handlePreferenceToggle = (
    key: keyof UserPreferences["preferences"],
    value: boolean
  ) => {
    if (!profile?.data?.preferences) return;

    updatePreferences({
      ...profile.data.preferences,
      [key]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text dark:text-text-light mb-2">
          Profile Settings
        </h1>
        <p className="text-text-muted">Manage your account preferences</p>
      </div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-text dark:text-text-light mb-4">
          Profile Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-light mb-1">
              Email
            </label>
            <Input
              value={profile?.data?.email || ""}
              disabled
              className="bg-light-100 dark:bg-dark-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-light mb-1">
              Name
            </label>
            <Input value={profile?.data?.name || ""} disabled />
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-text dark:text-text-light mb-4">
          Language
        </h2>
        <Select
          value={profile?.data?.language?.code}
          onChange={handleLanguageChange}
          options={
            languagesData?.data?.languages.map((lang) => ({
              value: lang.code,
              label: `${lang.name} (${lang.nativeName})`,
            })) || []
          }
          placeholder="Select language"
        />
      </motion.div>

      {/* Accessibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-text dark:text-text-light mb-4">
          Accessibility
        </h2>
        <div className="space-y-3">
          {accessibilitiesData?.data?.accessibilities.map((option) => {
            const isSelected = profile?.data?.accessibilityNeeds.some(
              (need) => need.value === option.value
            );

            return (
              <button
                key={option.value}
                onClick={() => handleAccessibilityToggle(option.value)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/10"
                    : "border-light-border dark:border-dark-border hover:border-primary/50 dark:hover:border-primary-dark/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      isSelected
                        ? "bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark text-white"
                        : "border-light-border dark:border-dark-border"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-text dark:text-text-light">
                      {option.name}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-text dark:text-text-light mb-4">
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text dark:text-text-light">
                Email Notifications
              </h3>
              <p className="text-sm text-text-muted">
                Receive updates via email
              </p>
            </div>
            <button
              onClick={() =>
                handlePreferenceToggle(
                  "emailNotification",
                  !profile?.data?.preferences.emailNotification
                )
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile?.data?.preferences.emailNotification
                  ? "bg-primary dark:bg-primary-dark"
                  : "bg-light-border dark:bg-dark-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile?.data?.preferences.emailNotification
                    ? "translate-x-6"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text dark:text-text-light">
                Push Notifications
              </h3>
              <p className="text-sm text-text-muted">
                Receive browser notifications
              </p>
            </div>
            <button
              onClick={() =>
                handlePreferenceToggle(
                  "pushNotification",
                  !profile?.data?.preferences.pushNotification
                )
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile?.data?.preferences.pushNotification
                  ? "bg-primary dark:bg-primary-dark"
                  : "bg-light-border dark:bg-dark-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  profile?.data?.preferences.pushNotification
                    ? "translate-x-6"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-text dark:text-text-light mb-4">
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-light mb-1">
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
            <label className="block text-sm font-medium text-text dark:text-text-light mb-1">
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
      </motion.div>
    </div>
  );
}
