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

  // Get user initial safely
  const getUserInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Extract lessons and pagination from the nested response
  const lessons = response?.data?.data || [];
  const pagination = response?.data?.pagination;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Error Loading Lessons</h2>
          <p className="text-text-muted">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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
                    {getUserInitial(lesson.userId?.name)}
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
              {(currentPage - 1) * (pagination.limit || 10) + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-text dark:text-text-light">
              {Math.min(
                currentPage * (pagination.limit || 10),
                pagination.total
              )}
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
