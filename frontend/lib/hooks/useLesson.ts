import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number;
  userRequest: string;
  createdAt: string;
  updatedAt: string;
}

interface InteractionResponse {
  status: boolean;
  message: string;
  data?: {
    audioUrl?: string;
  };
}

interface InteractionRequest {
  message: string;
  lessonId: string;
}

export const useLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const response = await apiFetch<Lesson>(`/lessons/${lessonId}`);
      if (!response.status || !response.data) {
        throw new Error(response.message || "Failed to fetch lesson");
      }
      return response.data;
    },
    enabled: !!lessonId,
  });
};

export const useLessonInteraction = () => {
  return useMutation({
    mutationFn: async ({ message, lessonId }: InteractionRequest) => {
      const response = await apiFetch<any>(
        "/lessons/interact",
        {
          method: "POST",
          body: { message, lessonId },
        }
      );
      return response;
    },
    onSuccess: (data) => {
      // if (data.status) {
      //   toast.success("Message sent successfully");
      // } else {
      //   toast.error(data.message || "Failed to send message");
      // }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Failed to send message. Please try again.";
      toast.error(errorMessage);
    },
  });
};
