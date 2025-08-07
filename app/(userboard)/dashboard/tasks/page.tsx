"use client";

import React from "react";
import { Card } from "@/app/components/ui";
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  Zap,
  Trophy,
  Book,
  FileText,
  Flame,
  Medal,
  TrendingUp,
  Target,
  Crown,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { tasksApi, type TaskProgress, type TaskProgressResponse, type Task } from "@/lib/api";

interface CategoryProgress {
  category: Task["category"];
  completed: number;
  required: number;
  remainingCount: number;
  potentialPoints: number;
}

interface TaskProgressData {
  currentLevel: number;
  totalPoints: number;
  nextLevelPoints: number;
  progress: CategoryProgress[];
}

export default function TasksPage() {
  // Fetch available tasks
  const { 
    data: availableTasksData,
    isLoading: isAvailableTasksLoading,
    error: availableTasksError
  } = useQuery({
    queryKey: ["available-tasks"],
    queryFn: async () => {
      const response = await tasksApi.getAvailableTasks();
      return response.data;
    }
  });

  // Fetch completed tasks
  const {
    data: completedTasksData,
    isLoading: isCompletedTasksLoading,
    error: completedTasksError
  } = useQuery({
    queryKey: ["completed-tasks"],
    queryFn: async () => {
      const response = await tasksApi.getCompletedTasks();
      return response.data;
    }
  });

  // Fetch task progress
  const {
    data: taskProgressData,
    isLoading: isTaskProgressLoading,
    error: taskProgressError
  } = useQuery({
    queryKey: ["task-progress"],
    queryFn: async () => {
      const response = await tasksApi.getTaskProgress();
      return response.data as TaskProgressResponse;
    }
  });

  // Loading state
  if (isAvailableTasksLoading || isCompletedTasksLoading || isTaskProgressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-600">Loading your quests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (availableTasksError || completedTasksError || taskProgressError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Something went wrong while loading your quests.</p>
          <p className="text-gray-600 mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  const availableTasks = availableTasksData || [];
  const completedTasks = completedTasksData || [];
  
  // Convert task progress data into our UI format
  const progressData: TaskProgressData = {
    currentLevel: 1,
    totalPoints: 0,
    nextLevelPoints: 100,
    progress: []
  };

  if (taskProgressData) {
    progressData.currentLevel = taskProgressData.currentLevel;
    progressData.totalPoints = taskProgressData.totalPoints;
    progressData.nextLevelPoints = taskProgressData.nextLevelPoints;
    progressData.progress = taskProgressData.progress.map(p => ({
      category: p.category,
      completed: p.completed,
      required: p.required,
      remainingCount: p.remainingCount,
      potentialPoints: p.potentialPoints
    }));
  }

  const getCategoryIcon = (category: CategoryProgress["category"]) => {
    switch (category) {
      case "LESSON":
        return <Book className="w-5 h-5" />;
      case "CONTENT":
        return <FileText className="w-5 h-5" />;
      case "STREAK":
        return <Flame className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryStyle = (category: CategoryProgress["category"]) => {
    switch (category) {
      case "LESSON":
        return {
          background: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-200",
          progress: "bg-blue-600"
        };
      case "CONTENT":
        return {
          background: "bg-purple-50",
          text: "text-purple-600",
          border: "border-purple-200",
          progress: "bg-purple-600"
        };
      case "STREAK":
        return {
          background: "bg-orange-50",
          text: "text-orange-600",
          border: "border-orange-200",
          progress: "bg-orange-600"
        };
      default:
        return {
          background: "bg-gray-50",
          text: "text-gray-600",
          border: "border-gray-200",
          progress: "bg-gray-600"
        };
    }
  };

  const allTasks = [...availableTasks, ...completedTasks].sort((a, b) =>
    a.task.order - b.task.order
  );

  const levelProgress = (progressData.totalPoints / progressData.nextLevelPoints) * 100;

  return (
    <div className="space-y-8 p-6">
      {/* Level Progress Header */}
      <div className="relative">
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 overflow-hidden">
          <div className="relative z-10 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
        <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Crown className="w-8 h-8" />
                  Level {progressData.currentLevel}
                </h1>
                <p className="text-white/80">Keep going! You're making great progress!</p>
        </div>
              <div className="text-right">
                <div className="text-4xl font-bold flex items-center gap-2">
                  {progressData.totalPoints}
                  <Zap className="w-8 h-8 text-yellow-300" />
      </div>
                <p className="text-white/80">Total Points</p>
            </div>
            </div>

            {/* Level Progress Bar */}
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>{progressData.totalPoints} points</span>
              <span>{progressData.nextLevelPoints} points needed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {progressData.progress.map((category) => {
          const style = getCategoryStyle(category.category);
          return (
            <Card key={category.category} className={cn("border transition-all hover:shadow-md", style.border)}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", style.background, style.text)}>
                    {getCategoryIcon(category.category)}
      </div>
                  <div className={cn("text-sm font-medium", style.text)}>
                    {category.completed}/{category.required}
              </div>
            </div>
                <h3 className="font-semibold text-gray-900">{category.category}</h3>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(category.completed / category.required) * 100}%` }}
                    className={cn("h-full rounded-full", style.progress)}
              />
            </div>
                <p className="mt-2 text-sm text-gray-600">
                  {category.potentialPoints > 0 ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      {category.potentialPoints} points available
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Completed
                    </span>
                  )}
                </p>
              </div>
            </Card>
          );
        })}
            </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Current Quests
        </h2>

      <div className="space-y-4">
          {allTasks.map((taskProgress) => {
            const style = getCategoryStyle(taskProgress.task.category);
            return (
              <motion.div
                key={taskProgress.task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={cn(
                  "border-2 transition-all hover:shadow-lg",
                  taskProgress.isCompleted ? "bg-gray-50" : style.border
                )}>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-xl", style.background, style.text)}>
                        {getCategoryIcon(taskProgress.task.category)}
                      </div>

                      <div className="flex-1">
                <div className="flex items-start justify-between">
                          <div>
                            <h3 className={cn(
                              "text-lg font-semibold",
                              taskProgress.isCompleted ? "text-gray-500" : "text-gray-900"
                            )}>
                              {taskProgress.task.title}
                    </h3>
                            <p className="text-gray-600 mt-1">
                              {taskProgress.task.description}
                    </p>
                  </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
                              style.background,
                              style.text
                            )}>
                              <Zap className="w-4 h-4" />
                              {taskProgress.task.points} points
                            </div>
                  </div>
                </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className={style.text}>
                              {taskProgress.progress}%
                            </span>
                  </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${taskProgress.progress}%` }}
                              className={cn("h-full rounded-full", style.progress)}
                            />
                  </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {taskProgress.isCompleted ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed! Earned {taskProgress.earnedPoints} points
                              </span>
                            ) : (
                              <span>
                                {taskProgress.remainingCount} {taskProgress.remainingCount === 1 ? 'task' : 'tasks'} remaining
                              </span>
                            )}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
              </motion.div>
            );
          })}
          </div>
      </div>
    </div>
  );
}
