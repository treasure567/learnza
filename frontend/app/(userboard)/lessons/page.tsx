"use client";

import { useState, useEffect } from "react";
import { lessonsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpenCheck,
  Search,
  Filter,
  Sparkles,
  Brain,
  Trophy,
  Target,
} from "lucide-react";
import type { ApiResponse } from "@/lib/api";
import GenerateLessonModal from "@/app/components/lesson/GenerateLessonModal";

// Types remain the same
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LessonsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery<ApiResponse<PaginatedResponse<Lesson>>>({
    queryKey: ["lessons", currentPage],
    queryFn: () => lessonsApi.getLessons(currentPage),
  });

  const getUserInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const lessons = response?.data?.data || [];
  const pagination = response?.data?.pagination;

  // Filter lessons based on search and difficulty
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || lesson.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/5 blur-2xl rounded-full" />
          <div className="relative bg-light-surface dark:bg-dark-surface border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-xl">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400"
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
            <h2 className="text-2xl font-bold mb-2 text-red-700 dark:text-red-400">Error Loading Lessons</h2>
            <p className="text-red-600 dark:text-red-300">
              {error instanceof Error ? error.message : "Please try again later"}
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              Retry
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (lessons.length === 0) {
    return (
      <motion.div 
        className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative">
            <motion.div 
              className="bg-light-surface dark:bg-dark-surface border-2 border-light-border dark:border-dark-border rounded-full p-8 mb-8 shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookOpenCheck className="w-16 h-16 text-primary dark:text-primary-dark" />
            </motion.div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-text dark:text-text-light mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          Begin Your Learning Journey
        </h2>
        <p className="text-text-muted max-w-lg mb-8 text-lg">
          Create your first lesson and let our AI guide you through an immersive learning experience tailored just for you.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setIsGenerateModalOpen(true)} 
            className="bg-gradient-to-r from-primary via-secondary to-accent text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 text-lg px-8 py-4 rounded-2xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your First Lesson
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "intermediate":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
      case "advanced":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800";
    }
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/lessons/${lessonId}`);
  };

  const handleGenerateSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary-dark/5 dark:via-secondary-dark/5 dark:to-accent-dark/5 p-8 mb-12">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-text dark:text-text-light mb-4">
                Your Learning Journey
              </h1>
              <p className="text-text-muted max-w-2xl text-lg">
                Explore personalized lessons crafted by AI to match your learning style and goals.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsGenerateModalOpen(true)}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-xl hover:shadow-primary/20 text-white transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate New Lesson
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div 
              className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-dark-border"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 dark:bg-primary-dark/10 rounded-xl">
                  <Brain className="w-6 h-6 text-primary dark:text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text dark:text-text-light">{lessons.length}</h3>
                  <p className="text-text-muted">Total Lessons</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-dark-border"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 dark:bg-secondary-dark/10 rounded-xl">
                  <Trophy className="w-6 h-6 text-secondary dark:text-secondary-dark" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text dark:text-text-light">
                    {lessons.filter(l => l.difficulty === "advanced").length}
                  </h3>
                  <p className="text-text-muted">Advanced Completed</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-dark-border"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 dark:bg-accent-dark/10 rounded-xl">
                  <Target className="w-6 h-6 text-accent dark:text-accent-dark" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text dark:text-text-light">
                    {Math.round(lessons.filter(l => l.difficulty === "beginner").length / lessons.length * 100)}%
                  </h3>
                  <p className="text-text-muted">Beginner Friendly</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-dark/50"
          />
        </div>
        <div className="flex gap-2">
          {["beginner", "intermediate", "advanced"].map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "primary" : "secondary"}
              onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
              className={`capitalize ${
                selectedDifficulty === difficulty 
                  ? "bg-primary text-white" 
                  : "hover:bg-light-surface dark:hover:bg-dark-surface"
              }`}
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <motion.div 
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {filteredLessons.map((lesson) => (
            <motion.div
              key={lesson._id}
              variants={fadeInUp}
              layout
              onClick={() => handleLessonClick(lesson._id)}
              className="group relative bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary-dark/5 dark:via-secondary-dark/5 dark:to-accent-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text dark:text-text-light line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                    {lesson.title}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>

                <p className="text-text-muted line-clamp-3 mb-6">{lesson.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-text-muted">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{formatTime(lesson.estimatedTime)}</span>
                    </div>
                    <motion.div 
                      className="flex items-center text-primary dark:text-primary-dark"
                      whileHover={{ scale: 1.1 }}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Start</span>
                    </motion.div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-sm font-medium text-primary dark:text-primary-dark">
                        {getUserInitial(lesson.userId?.name)}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {pagination && (
        <motion.div 
          className="flex items-center justify-between pt-8 border-t border-light-border dark:border-dark-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-text-muted">
            Showing{" "}
            <span className="font-medium text-text dark:text-text-light">
              {(currentPage - 1) * (pagination.limit || 10) + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-text dark:text-text-light">
              {Math.min(currentPage * (pagination.limit || 10), pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text dark:text-text-light">
              {pagination.total}
            </span>{" "}
            lessons
          </p>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev}
                className="rounded-xl hover:bg-primary/5 dark:hover:bg-primary-dark/5"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNext}
                className="rounded-xl hover:bg-primary/5 dark:hover:bg-primary-dark/5"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Generate Lesson Modal */}
      <GenerateLessonModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}
