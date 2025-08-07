"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/app/components/ui";
import { useRouter } from "nextjs-toploader/app";
import {
  BookOpen,
  Plus,
  Clock,
  Star,
  Play,
  CheckCircle2,
  BarChart3,
  Filter,
  Search,
  X
} from "lucide-react";
import { Modal, Button } from "@/app/components/ui";
import { useSettingsStore } from "@/lib/store/settings";
import { lessonsApi, ApiResponse } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useLessonGeneration } from "@/lib/hooks/useLessonGeneration";
import { toast } from "sonner";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  userId: string;
  userRequest: string;
  createdAt: string;
  updatedAt: string;
  status: "not_started" | "in_progress" | "completed";
  generatingStatus: "not_started" | "in_progress" | "completed" | "failed";
  progress: number;
  lastAccessedAt: string;
  __v: number;
}

interface ProgressStats {
  averageProgress: number;
  totalLessons: number;
}

interface LessonResponse {
  lessons: Lesson[];
  progressStats: ProgressStats;
}

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
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const generateLesson = useLessonGeneration();

  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    areaOfFocus: "",
  });
  const [languageCode, setLanguageCode] = useState<string>(
    useSettingsStore.getState().language || "en"
  );
  const setAppLanguage = useSettingsStore((s) => s.setLanguage);

  const { data: response, isLoading: isLoadingLessons, error, refetch } = useQuery<
    ApiResponse<PaginatedResponse<LessonResponse>>,
    Error
  >({ 
    queryKey: ["lessons", currentPage],
    queryFn: async () => {
      const response = await lessonsApi.getLessons(currentPage);
      return response as unknown as ApiResponse<PaginatedResponse<LessonResponse>>;
    },
    refetchInterval: 4000,
  });

  const { data: generatingLessons, isLoading: isGeneratingLessonsLoading, error: generatingLessonsError, refetch: refetchGeneratingLessons } = useQuery<
    ApiResponse<Lesson[]>,
    Error
  >({ 
    queryKey: ["check-for-generating"],
    queryFn: async () => {
      const response = await lessonsApi.checkForGeneratingLessons();
      return response as unknown as ApiResponse<Lesson[]>;
    },
  });

  useEffect(() => {
    if (!isLoadingLessons && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isLoadingLessons]);

  useEffect(() => {
    refetch();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // @ts-ignore
  const lessonsList: Lesson[] = response?.data?.lessons || [];
  const progressStats: ProgressStats = {
    averageProgress:
      lessonsList.length > 0
        ? Math.round(
            lessonsList.reduce((sum: number, lesson: Lesson) => sum + (lesson.progress || 0), 0) /
              lessonsList.length
          )
        : 0,
    totalLessons: lessonsList.length,
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = (difficulty || "").toLowerCase();
    switch (d) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in_progress": return <Play className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const generationSteps = [
    { title: "Analyzing your request", description: "Processing your learning goals..." },
    { title: "Designing curriculum", description: "Creating personalized learning path..." },
    { title: "Generating content", description: "Crafting engaging materials..." },
    { title: "Finalizing lesson", description: "Putting everything together..." }
  ];

  const simulateProgress = () => {
    setShowProgressModal(true);
    setGenerationStep(0);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    setTimeout(() => setGenerationStep(1), 2500);
    setTimeout(() => setGenerationStep(2), 5000);
    setTimeout(() => setGenerationStep(3), 7500);
    
    const interval = setInterval(async () => {
      const result = await refetchGeneratingLessons();
      if ((result.data?.data?.length ?? 0) > 0) {
        refetch();
        setShowProgressModal(false);
        setProgress(0);
        setGenerationStep(0);
        clearInterval(interval);
        clearInterval(progressInterval);
      }
    }, 1000);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.description.trim()) {
      toast.error("Please enter a description");
      return;
    };
    
    setIsGenerating(true);
    
    try {
      const result = await generateLesson.mutateAsync({
        message: newLesson.description,
        languageCode: languageCode,
      });
      if (result.status) {
        setShowCreateModal(false);
        simulateProgress();
      } else {
        toast.error("Failed to create lesson");
      }
    } catch (error) {
      toast.error("Failed to create lesson");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredLessons = lessonsList.filter((lesson: Lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === "all" || lesson.status === filterBy;
    return matchesSearch && matchesFilter;
  });

  if (isLoadingLessons && isFirstLoad) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-400 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-4 border-gray-200" />
        </div>
        <p className="mt-4 text-gray-600 text-lg">Loading your lessons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
          <p className="text-lg text-gray-600 mt-1">Track your learning progress and discover new content</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Lesson
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{lessonsList.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {lessonsList.filter((l: Lesson) => l.status === "completed").length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {lessonsList.filter((l: Lesson) => l.status === "in_progress").length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Play className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressStats.averageProgress}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-300 transition-colors min-w-[180px] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_12px_center] bg-no-repeat"
          >
            <option value="all">All Lessons</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson: Lesson) => (
          <Card 
            key={lesson._id} 
            className={`group hover:border-gray-300 transition-all duration-300 hover:shadow-md overflow-hidden rounded-xl p-5 hover:-translate-y-0.5 ${
              (lesson.generatingStatus === "in_progress" || lesson.generatingStatus === "not_started") ? 
              "relative bg-white" : ""
            }`}
          >
            {(lesson.generatingStatus === "in_progress" || lesson.generatingStatus === "not_started") && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
                <div className="relative text-center p-6 space-y-5">
                  {/* Ring loader */}
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-400 animate-spin-slow" />
                    <div className="absolute inset-4 rounded-full border-4 border-gray-200" />
                  </div>
                  {/* Title and subtext */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Crafting your lesson
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Building your personalized learning experience…
                    </p>
                  </div>
                  {/* Progress shimmer */}
                  <div className="mx-auto w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-[shimmer_1.2s_infinite] rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{lesson.description}</p>
                </div>
                {getStatusIcon(lesson.status)}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{lesson.progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${lesson.progress.toFixed(0)}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {(lesson.generatingStatus === "in_progress" || lesson.generatingStatus === "not_started") ? (
                        <span className="inline-flex items-center">
                          <span className="animate-pulse">Building</span>
                          <span className="ml-1 inline-flex space-x-0.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        </span>
                      ) : formatTime(lesson.estimatedTime)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty?.charAt(0)?.toUpperCase() + lesson.difficulty?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="secondary"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => router.push(`/dashboard/lessons/${lesson._id}`)}
                disabled={lesson.generatingStatus === "in_progress" || lesson.generatingStatus === "not_started"}
              >
                {lesson.generatingStatus === "in_progress" || lesson.generatingStatus === "not_started" ? 
                  "Generating..." : 
                  lesson.status === "completed" ? "Review" : lesson.status === "in_progress" ? "Continue" : "Start"
                }
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Lesson Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Lesson"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newLesson.description}
              onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Hi there, what would you like to learn today?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={languageCode}
              onChange={(e) => { setLanguageCode(e.target.value); setAppLanguage(e.target.value); }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            >
              <option value="en">English (en)</option>
              <option value="yo">Yorùbá (yo)</option>
              <option value="ig">Igbo (ig)</option>
              <option value="ha">Hausa (ha)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLesson}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                "Create Lesson"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => {}}
        title="Generating Your Lesson"
      >
        <div className="space-y-8 py-4">
          {/* Current Step */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {generationSteps[generationStep].title}
            </h3>
            <p className="text-gray-600">
              {generationSteps[generationStep].description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progress}% Complete</span>
              <span>{((10 * progress) / 100).toFixed(1)}s</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {generationSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 ${
                  index === generationStep
                    ? "text-green-600"
                    : index < generationStep
                    ? "text-gray-400"
                    : "text-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index === generationStep
                      ? "bg-green-100"
                      : index < generationStep
                      ? "bg-gray-100"
                      : "bg-gray-50"
                  }`}
                >
                  {index < generationStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : index === generationStep ? (
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}