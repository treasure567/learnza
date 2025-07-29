"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api";
import { useSettingsStore } from "../store/settings";
import { toast } from "sonner";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: userApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      // Update profile in cache
      queryClient.setQueryData(["profile"], data);

      // Show success message
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAccessibility() {
  const setAccessibility = useSettingsStore((state) => state.setAccessibility);

  return useMutation({
    mutationFn: userApi.updateAccessibility,
    onSuccess: (data) => {
      // Update accessibility settings in store
      if (data.data?.accessibilityNeeds) {
        setAccessibility(data.data.accessibilityNeeds);
      }

      // Show success message
      toast.success("Accessibility settings updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLanguage() {
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return useMutation({
    mutationFn: userApi.updateLanguage,
    onSuccess: (data) => {
      // Update language in store
      if (data.data?.language) {
        setLanguage(data.data.language.code);
      }

      // Show success message
      toast.success("Language updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to access current settings
export function useSettings() {
  const settings = useSettingsStore();
  return settings;
}
