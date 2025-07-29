"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Sparkles,
  BookOpen,
  Target,
  Flame,
  Crown,
  Zap,
  Award,
  ChevronRight,
  Gift,
  CheckCircle,
  Medal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import type { TaskProgress } from "@/lib/api";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const glowVariants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "LESSON":
      return <BookOpen className="w-6 h-6" />;
    case "CONTENT":
      return <Target className="w-6 h-6" />;
    case "STREAK":
      return <Flame className="w-6 h-6" />;
    default:
      return <Star className="w-6 h-6" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "LESSON":
      return "from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600";
    case "CONTENT":
      return "from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600";
    case "STREAK":
      return "from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600";
    default:
      return "from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600";
  }
};

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Fetch both available and completed tasks
  const { 
    data: availableTasks, 
    isLoading: isLoadingAvailable,
    error: availableError 
  } = useQuery<TaskProgress[]>({
    queryKey: ["tasks", "available"],
    queryFn: () => tasksApi.getAvailableTasks().then(res => res.data || []),
  });

  const {
    data: completedTasks,
    isLoading: isLoadingCompleted,
    error: completedError
  } = useQuery<TaskProgress[]>({
    queryKey: ["tasks", "completed"],
    queryFn: () => tasksApi.getCompletedTasks().then(res => res.data || []),
  });

  const isLoading = isLoadingAvailable || isLoadingCompleted;
  const error = availableError || completedError;

  // Combine and filter tasks based on selected filter
  const allTasks = [...(availableTasks || []), ...(completedTasks || [])];
  const filteredTasks = filter === "all" 
    ? allTasks
    : filter === "completed" 
    ? completedTasks || []
    : availableTasks || [];

  // Calculate stats
  const totalPoints = allTasks.reduce((sum, item) => sum + item.earnedPoints, 0);
  const completedTasksCount = (completedTasks || []).length;
  const totalTasksCount = allTasks.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your quests...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Failed to Load Quests
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6 gap-2"
            >
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Daily Quests Available!</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Quest Journey
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Complete tasks, earn points, and level up your skills. Every quest brings you closer to mastery!
            </p>
          </motion.div>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 inset-x-0">
          <svg className="w-full h-8 text-slate-50 dark:text-slate-900" preserveAspectRatio="none" viewBox="0 0 1200 50" fill="currentColor">
            <path d="M0 25h1200v25H0z" />
            <path d="M0 0c300 0 400 50 600 50s300-50 600-50v25H0z" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {totalPoints}
                  </h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">pts</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Total Points</p>
              </div>
            </div>
          </div>

          {/* Other stat cards with real data */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    Level {Math.floor(totalPoints / 100) + 1}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Current Rank</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {completedTasksCount}
                  </h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/ {totalTasksCount}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Tasks Completed</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Your Quests
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filter === "all"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                All Tasks
              </button>
              <button 
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filter === "active"
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                In Progress
              </button>
              <button 
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filter === "completed"
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredTasks.map((item) => (
              <motion.div
                key={item.task._id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 border ${
                  item.isCompleted
                    ? "border-emerald-200 dark:border-emerald-800/30"
                    : "border-slate-200/50 dark:border-slate-700/50"
                } hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300`}
              >
                {/* Completion Badge */}
                {item.isCompleted && (
                  <div className="absolute -top-3 -right-3 flex items-center justify-center">
                    <div className="relative">
                      <Medal className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                      <div className="absolute inset-0 animate-ping opacity-20 text-yellow-500">
                        <Medal className="w-8 h-8" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getCategoryColor(item.task.category)} text-white shadow-lg ${
                        item.isCompleted ? "opacity-90" : ""
                      }`}>
                        {getCategoryIcon(item.task.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          {item.task.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {item.task.description}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm ${
                      item.isCompleted
                        ? "bg-emerald-50 dark:bg-emerald-900/30"
                        : "bg-yellow-50 dark:bg-yellow-900/30"
                    }`}>
                      <Sparkles className={`w-4 h-4 ${
                        item.isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`} />
                      <span className={`text-sm font-semibold ${
                        item.isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}>
                        {item.earnedPoints}/{item.task.points} pts
                      </span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.progress}/{item.task.requiredCount}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.progress / item.task.requiredCount) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${
                          item.isCompleted
                            ? "from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600"
                            : getCategoryColor(item.task.category)
                        } rounded-full shadow-lg`}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    className={`mt-6 w-full px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      item.isCompleted
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                        : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {item.isCompleted ? (
                      <>
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Continue Quest
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}