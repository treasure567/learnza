"use client";

import React, { useState } from "react";
import { Card } from "@/app/components/ui";
import { ChevronDown, ChevronUp, Search, HelpCircle, BookOpen, Mic, Settings, CreditCard, Shield, Users, Zap } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

export default function HelpsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const faqs: FAQ[] = [
    {
      id: 1,
      question: "How do I start my first AI tutor session?",
      answer: "To start your first AI tutor session, navigate to the Lessons page and click on any lesson. Then click 'Start' or 'Continue' to begin your interactive voice session with the AI tutor. Make sure your microphone is enabled and working properly.",
      category: "getting-started",
      icon: <Mic className="w-5 h-5 mr-2" />
    },
    {
      id: 2,
      question: "What topics can I learn with the AI tutor?",
      answer: "Our AI tutor covers a wide range of subjects including programming, mathematics, science, languages, business, and more. You can browse available lessons in the Lessons section or create custom lessons based on your specific learning goals.",
      category: "topics",
      icon: <BookOpen className="w-5 h-5 mr-2" />
    },
    {
      id: 3,
      question: "How do I create a custom lesson?",
      answer: "To create a custom lesson, go to the Lessons page and click the 'Create Lesson' button. Fill in the lesson title, description, and area of focus. The AI will then generate a personalized learning experience based on your specifications.",
      category: "lessons",
      icon: <Zap className="w-5 h-5 mr-2" />
    },
    {
      id: 4,
      question: "Can I use the AI tutor without a microphone?",
      answer: "Currently, our AI tutor requires a microphone for voice interaction. This allows for natural conversation and real-time feedback. We recommend using a good quality microphone for the best experience.",
      category: "technical",
      icon: <Settings className="w-5 h-5 mr-2" />
    },
    {
      id: 5,
      question: "How do I track my learning progress?",
      answer: "Your learning progress is automatically tracked in the dashboard. You can view completed lessons, current progress, and learning statistics. The system saves your progress so you can continue where you left off.",
      category: "progress",
      icon: <Users className="w-5 h-5 mr-2" />
    },
    {
      id: 6,
      question: "Is my data secure and private?",
      answer: "Yes, we take data security seriously. All conversations with the AI tutor are encrypted and stored securely. We never share your personal information or learning data with third parties. You can read our full privacy policy for more details.",
      category: "privacy",
      icon: <Shield className="w-5 h-5 mr-2" />
    },
    {
      id: 7,
      question: "Can I use the AI tutor on mobile devices?",
      answer: "Yes! Our platform is fully responsive and works on all devices including smartphones and tablets. The voice interaction feature is optimized for mobile use, though we recommend using headphones for better audio quality.",
      category: "technical",
      icon: <Settings className="w-5 h-5 mr-2" />
    },
    {
      id: 8,
      question: "How accurate is the AI tutor's knowledge?",
      answer: "Our AI tutor is trained on extensive educational content and is regularly updated with the latest information. However, we recommend cross-referencing important information with authoritative sources for critical learning.",
      category: "quality",
      icon: <HelpCircle className="w-5 h-5 mr-2" />
    },
    {
      id: 9,
      question: "How do I report a bug or issue?",
      answer: "If you encounter any issues, please use the 'Report Issue' feature in the Settings menu or contact our support team directly. We appreciate your feedback and work quickly to resolve any problems.",
      category: "support",
      icon: <HelpCircle className="w-5 h-5 mr-2" />
    }
  ];

  const categories = [
    { id: "all", name: "All Questions", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "getting-started", name: "Getting Started", icon: <Mic className="w-4 h-4" /> },
    { id: "lessons", name: "Lessons", icon: <BookOpen className="w-4 h-4" /> },
    { id: "technical", name: "Technical", icon: <Settings className="w-4 h-4" /> },
    { id: "privacy", name: "Privacy", icon: <Shield className="w-4 h-4" /> }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Help Center</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions and learn how to make the most of your AI tutor experience
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? "bg-green-100 text-green-700 border-2 border-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* FAQ Grid */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredFaqs.map((faq) => (
          <Card key={faq.id} className="overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-green-600">
                    {faq.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {faq.question}
                  </h3>
                </div>
                <div className="text-gray-400">
                  {openFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 mr-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 mr-2" />
                  )}
                </div>
              </div>
            </button>
            
            {openFaq === faq.id && (
              <div className="px-6 pb-4">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>


    </div>
  );
}
