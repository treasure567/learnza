"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, Button, BoluCallModal, LearnzaSmsModal } from "@/app/components/ui";
import { BookOpen, Book, Star, Clock, TrendingUp, CheckCircle2, Target, Award, Coins, Phone, MessageSquare } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [showBoluModal, setShowBoluModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);

  // Chart data
  const weekData = [
    { day: "Mon", hours: 2.5, tokens: 50 },
    { day: "Tue", hours: 3.2, tokens: 75 },
    { day: "Wed", hours: 1.8, tokens: 60 },
    { day: "Thu", hours: 4.0, tokens: 90 },
    { day: "Fri", hours: 2.8, tokens: 65 },
    { day: "Sat", hours: 3.5, tokens: 85 },
    { day: "Sun", hours: 2.0, tokens: 70 },
  ];

  const stats = [
    {
      label: "Total Lessons",
      value: "12",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed Tasks",
      value: "24",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Learning Streak",
      value: "7 days",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const recentLessons = [
    { id: 1, title: "Introduction to Python", progress: 80 },
    { id: 2, title: "Web Development Basics", progress: 45 },
    { id: 3, title: "Data Structures", progress: 20 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-lg text-gray-600">Here's an overview of your learning progress</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowSmsModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            SMS Learnza
          </Button>
          <Button
            onClick={() => setShowBoluModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Phone className="w-4 h-4 mr-2" />
            Phone Call Bolu
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Learning Progress</h2>
              <p className="text-sm text-gray-500 mt-1">Hours spent learning this week</p>
            </div>
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="#2A9D8F" fill="#E6F4F2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Token Earnings</h2>
              <p className="text-sm text-gray-500 mt-1">LZA tokens earned this week</p>
            </div>
            <Coins className="w-5 h-5 mr-2 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="tokens" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Lessons & Learning Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Lessons</h2>
            <BookOpen className="w-5 h-5 mr-2 text-gray-400" />
          </div>
          <div className="space-y-5">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{lesson.title}</span>
                  <span className="text-sm font-semibold text-gray-600">{lesson.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/dashboard/lessons" 
            className="inline-flex items-center mt-6 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            View all lessons
            <TrendingUp className="w-4 h-4 ml-2" />
          </Link>
        </Card>

        {/* Learning Goals */}
        <Card className="hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Goals</h2>
            <Target className="w-5 h-5 mr-2 text-gray-400" />
          </div>
          <div className="space-y-5">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 mr-2 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Study for 2 hours today</p>
                <p className="text-sm text-gray-600 mt-1">Progress: 1.2/2 hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <Award className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Complete 3 lessons this week</p>
                <p className="text-sm text-gray-600 mt-1">Progress: 2/3 lessons</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <Book className="w-5 h-5 mr-2 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Finish current course module</p>
                <p className="text-sm text-gray-600 mt-1">85% complete</p>
              </div>
            </div>
          </div>
          <Link 
            href="/dashboard/tasks" 
            className="inline-flex items-center mt-6 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            View all tasks
            <Star className="w-4 h-4 ml-2" />
          </Link>
        </Card>
      </div>

      {/* Bolu Call Modal */}
      <BoluCallModal
        isOpen={showBoluModal}
        onClose={() => setShowBoluModal(false)}
        onConfirm={() => {
          // Here you would handle the actual call logic
          // For now, we'll just close the modal
          setShowBoluModal(false);
          // You could add a toast notification here
        }}
      />

      {/* Learnza SMS Modal */}
      <LearnzaSmsModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        onConfirm={() => {
          setShowSmsModal(false);
        }}
      />
    </div>
  );
}
