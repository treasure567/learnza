import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface GenerateLessonResponse {
  status: boolean;
  message: string;
  data: any;
}

export const useLessonGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: { message: string; languageCode?: string }
    ) => {
      const { message, languageCode } = params;
      const response = await apiFetch<GenerateLessonResponse>(
        "/lessons/generate",
        {
          method: "POST",
          body: { message, languageCode },
        }
      );
      return response;
    },
    onSuccess: (data) => {
      // Show success message from backend
      if (data.status) {
        toast.success(data.message || "Lesson generated successfully!");
        // Invalidate lessons query to refetch after generation
        queryClient.invalidateQueries({ queryKey: ["lessons"] });
      } else {
        // Handle validation errors
        if (
          data.data &&
          data.data.message &&
          Array.isArray(data.data.message)
        ) {
          data.data.message.forEach((error: string) => {
            toast.error(error);
          });
        } else {
          toast.error(data.message || "Failed to generate lesson");
        }
      }
    },
    onError: (error: any) => {
      // Handle network or other errors
      const errorMessage =
        error?.message || "Failed to generate lesson. Please try again.";
      toast.error(errorMessage);
    },
  });
};
