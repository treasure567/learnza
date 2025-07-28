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

export const useLessonInteract = (lessonId: string) => {
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await apiFetch<{ audioUrl: string }>(`/lessons/interact`, {
        method: "POST",
        body: { message, lessonId },
      });
    },
  });
};
