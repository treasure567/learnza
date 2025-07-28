"use client";

import { useState, useEffect } from "react";
import { lessonsApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpenCheck,
} from "lucide-react";
import type { ApiResponse } from "@/lib/api";

// Types
type Lesson = {
  _id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  userId: {
    email: string;
    name: string;
    emailVerifiedAt: string;
    language: string;
    accessibilityNeeds: string[];
    preferences: {
      emailNotification: boolean;
      pushNotification: boolean;
      theme: "light" | "dark";
    };
  };
  userRequest: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export default function LessonsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: response,
    isLoading,
    error,
  } = useQuery<ApiResponse<PaginatedResponse<Lesson>>>({
    queryKey: ["lessons", currentPage],
    queryFn: () => lessonsApi.getLessons(currentPage),
  });

  // Debug logs
  useEffect(() => {
    if (error) {
      console.error("Error fetching lessons:", error);
    }
    if (response) {
      console.log("API Response:", {
        status: response.status,
        message: response.message,
        data: response.data,
      });
    }
  }, [error, response]);

  // Extract lessons and pagination from the nested response
  const lessons = response?.data?.data || [];
  const pagination = response?.data?.pagination;

  // Debug logs
  console.log("Response:", response);
  console.log("Lessons:", lessons);
  console.log("Pagination:", pagination);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Empty state
  if (lessons.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary-dark/5 dark:via-secondary-dark/5 dark:to-accent-dark/5 rounded-full blur-3xl" />

          {/* Icon */}
          <div className="relative bg-light-surface dark:bg-dark-surface border-2 border-light-border dark:border-dark-border rounded-full p-6 mb-6">
            <BookOpenCheck className="w-12 h-12 text-primary dark:text-primary-dark" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text dark:text-text-light mb-3">
          No Lessons Yet
        </h2>
        <p className="text-text-muted max-w-md mb-8">
          Start your learning journey by creating your first lesson. Our AI will
          help you create engaging and interactive content.
        </p>

        <Button onClick={() => {}} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Start New Lesson
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-light">
          Lessons
        </h1>
        <Button>Start New Lesson</Button>
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <motion.div
            key={lesson._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 space-y-4 hover:border-primary/50 dark:hover:border-primary-dark/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-text dark:text-text-light line-clamp-2">
                {lesson.title}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                  lesson.difficulty
                )}`}
              >
                {lesson.difficulty}
              </span>
            </div>

            <p className="text-text-muted line-clamp-3">{lesson.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-text-muted">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {formatTime(lesson.estimatedTime)}
                  </span>
                </div>
                <div className="flex items-center text-text-muted">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="text-sm">Start</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary dark:text-primary-dark">
                    {lesson.userId.name[0].toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between pt-6 border-t border-light-border dark:border-dark-border">
          <p className="text-sm text-text-muted">
            Showing{" "}
            <span className="font-medium text-text dark:text-text-light">
              {(currentPage - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-text dark:text-text-light">
              {Math.min(currentPage * 10, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text dark:text-text-light">
              {pagination.total}
            </span>{" "}
            lessons
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
