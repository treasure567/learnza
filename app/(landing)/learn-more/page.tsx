"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/app/components/ui";
import { ArrowRight, BookOpen, Code, Compass, Lightbulb } from "lucide-react";

export default function LearnMore() {
  const features = [
    {
      title: "Interactive Learning",
      description: "Engage with hands-on exercises and real-world projects that reinforce your learning.",
      icon: <Code className="w-6 h-6" />,
    },
    {
      title: "Guided Pathways",
      description: "Follow structured learning paths designed by industry experts.",
      icon: <Compass className="w-6 h-6" />,
    },
    {
      title: "Comprehensive Resources",
      description: "Access a vast library of learning materials, tutorials, and documentation.",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: "Smart Recommendations",
      description: "Get personalized course suggestions based on your learning progress and goals.",
      icon: <Lightbulb className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              Discover the Future of Learning
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Explore our comprehensive learning platform designed to help you master new skills and achieve your goals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/signup">
                <Button size="lg" className="bg-green-800 hover:bg-green-900">
                  Start Learning Now
                  <ArrowRight className="ml-2 w-5 h-5 mr-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl"
              >
                <div className="text-green-800 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation-style Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-green">
            <h2>Getting Started with Learnza</h2>
            <p>
              Our platform is designed to make learning accessible, engaging, and effective. Here's how you can get started:
            </p>
            <h3>1. Create Your Account</h3>
            <p>
              Sign up for a free account to access our basic features. Premium accounts unlock additional content and features.
            </p>
            <h3>2. Choose Your Learning Path</h3>
            <p>
              Browse our catalog of courses and select a learning path that matches your goals. Our AI-powered system can help recommend the best path for you.
            </p>
            <h3>3. Track Your Progress</h3>
            <p>
              Monitor your learning journey with detailed progress tracking, achievements, and certifications.
            </p>
            <h3>4. Join the Community</h3>
            <p>
              Connect with fellow learners, participate in discussions, and share your knowledge with others.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-green-100 mb-8">
              Join thousands of learners who are already benefiting from our platform.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-green-800 hover:bg-green-50">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
