"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/app/components/ui";
import { BookOpen, Book, Star, Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  // Sample data - in a real app, this would come from your API
  const stats = [
    {
      label: "Total Lessons",
      value: "12",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      label: "Completed Tasks",
      value: "24",
      icon: Book,
      color: "text-green-600",
    },
    {
      label: "Learning Streak",
      value: "7 days",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  const recentLessons = [
    { id: 1, title: "Introduction to Python", progress: 80 },
    { id: 2, title: "Web Development Basics", progress: 45 },
    { id: 3, title: "Data Structures", progress: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-600">Here's an overview of your learning progress</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Lessons</h2>
          <div className="space-y-4">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{lesson.title}</span>
                  <span className="text-gray-600">{lesson.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/lessons" 
            className="inline-block mt-4 text-sm text-green-600 hover:text-green-700"
          >
            View all lessons →
          </Link>
        </Card>

        {/* Learning Goals */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Learning Goals</h2>
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Study for 2 hours today</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 mr-2" />
              <span>Complete 3 lessons this week</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Book className="w-4 h-4 mr-2" />
              <span>Finish current course module</span>
            </div>
          </div>
          <Link 
            href="/tasks" 
            className="inline-block mt-4 text-sm text-green-600 hover:text-green-700"
          >
            View all tasks →
          </Link>
        </Card>
      </div>
    </div>
  );
}