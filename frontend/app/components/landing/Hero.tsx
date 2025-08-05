"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../ui";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] py-32 flex items-center justify-center overflow-hidden bg-white">
      {/* Content */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-whiterounded-full px-4 py-2 mb-8"
          >
            <div className="flex -space-x-2">
              <img
                src="https://tapback.co/api/avatar/user1.webp"
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <img
                src="https://tapback.co/api/avatar/user2.webp"
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <img
                src="https://tapback.co/api/avatar/user3.webp"
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <img
                src="https://tapback.co/api/avatar/user4.webp"
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              Trusted by 25,000+ learners across Africa
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-gray-900 leading-tight"
          >
            Learn Smarter.
            <span className="block text-green-600">Grow Faster.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 text-gray-800"
          >
            With Courses That Fit Your Goals.
          </motion.p>

          {/* Descriptive Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl mb-12 text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            Master industry-ready skills with curated courses, expert mentors, and real-world projects — anytime, anywhere.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-2">
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="w-full sm:w-auto text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-2"
            >
              Learn More
              <BookOpen className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 