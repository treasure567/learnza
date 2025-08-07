"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-50 opacity-50" />

      {/* Large 404 Background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full"
        >
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold text-gray-100">
            404
          </h2>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700">
            Page Not Found
          </h2>
        </div>

        <div className="max-w-md mx-auto">
          <p className="text-gray-600 text-center">
            Oops! The page you're looking for seems to have wandered off into
            the digital wilderness. Let's get you back on track.
          </p>
        </div>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm mt-8"
          >
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </main>
  );
}
