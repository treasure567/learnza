"use client";

import { useState } from "react";
import { lessonsApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui";
import { useQuery } from "@tanstack/react-query";
import { Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function LessonsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ["lessons", currentPage],
    queryFn: () => lessonsApi.getLessons(currentPage),
  });

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
        {lessonsData?.data?.data.map((lesson) => (
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
      {lessonsData?.data?.pagination && (
        <div className="flex items-center justify-between pt-6 border-t border-light-border dark:border-dark-border">
          <p className="text-sm text-text-muted">
            Showing{" "}
            <span className="font-medium text-text dark:text-text-light">
              {(currentPage - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-text dark:text-text-light">
              {Math.min(currentPage * 10, lessonsData.data.pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text dark:text-text-light">
              {lessonsData.data.pagination.total}
            </span>{" "}
            lessons
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={!lessonsData.data.pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!lessonsData.data.pagination.hasNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
