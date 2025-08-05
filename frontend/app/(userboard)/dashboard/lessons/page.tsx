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

const pulseAnimation = {
  scale: [1, 1.02, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const buttonHoverAnimation = {
  scale: 1.02,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10,
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-emerald-100/50 dark:border-emerald-800/30 shadow-xl shadow-emerald-900/5 overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/30" />
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="max-w-2xl">
                  <motion.h1 
                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Your Learning Journey
                  </motion.h1>
                  <motion.p 
                    className="text-lg text-slate-600 dark:text-slate-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Embark on a personalized learning adventure with AI-crafted lessons designed to match your unique style and goals.
                  </motion.p>
                </div>
                <motion.div
                  whileHover={buttonHoverAnimation}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="relative"
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    <span className="relative">Generate New Lesson</span>
                  </button>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  {
                    icon: Brain,
                    label: "Total Lessons",
                    value: lessons.length,
                    gradient: "from-emerald-500 to-teal-500",
                  },
                  {
                    icon: Trophy,
                    label: "Advanced Completed",
                    value: lessons.filter(l => l.difficulty === "advanced").length,
                    gradient: "from-teal-500 to-cyan-500",
                  },
                  {
                    icon: Target,
                    label: "Beginner Friendly",
                    value: `${Math.round(lessons.filter(l => l.difficulty === "beginner").length / lessons.length * 100)}%`,
                    gradient: "from-cyan-500 to-blue-500",
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                            {stat.value}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-lg" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {["beginner", "intermediate", "advanced"].map((difficulty) => (
              <motion.button
                key={difficulty}
                whileHover={buttonHoverAnimation}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedDifficulty === difficulty
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-500/50"
                }`}
              >
                {difficulty}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredLessons.map((lesson) => (
              <motion.div
                key={lesson._id}
                variants={fadeInUp}
                layout
                whileHover={{ y: -4 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-400/50 transition-all duration-300 overflow-hidden"
              >
                {/* Lesson Icon */}
                <div className="absolute top-4 right-4">
                  <div className={`p-2 rounded-xl ${
                    lesson.difficulty === "beginner" 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : lesson.difficulty === "intermediate"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  }`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">
                    {lesson.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-6">
                    {lesson.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{formatTime(lesson.estimatedTime)}</span>
                      </div>
                      <motion.button
                        whileHover={buttonHoverAnimation}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLessonClick(lesson._id)}
                        className="inline-flex items-center px-4 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors duration-200"
                      >
                        Start Lesson
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </motion.button>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                    >
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {getUserInitial(lesson.userId?.name)}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {pagination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-slate-200">{(currentPage - 1) * (pagination.limit || 10) + 1}</span>
              {" "}-{" "}
              <span className="font-medium text-slate-900 dark:text-slate-200">
                {Math.min(currentPage * (pagination.limit || 10), pagination.total)}
              </span>
              {" "}of{" "}
              <span className="font-medium text-slate-900 dark:text-slate-200">{pagination.total}</span> lessons
            </p>

            <div className="flex gap-2">
              <motion.button
                whileHover={buttonHoverAnimation}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800/30 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-500/50 transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={buttonHoverAnimation}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNext}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800/30 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-500/50 transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
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
    </div>
  );
}
