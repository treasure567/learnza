"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Play } from "lucide-react";

export default function DemoVideo() {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);

  return (
    <section className="py-16 bg-gray-50 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black"
          >
            {!isVideoPlaying ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <img
                  src="/demo-thumbnail.jpg"
                  alt="Platform Demo"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors group"
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/90 group-hover:bg-white group-hover:scale-105 transition-all">
                    <Play className="w-6 h-6 text-green-600 group-hover:text-green-700" />
                  </div>
                </button>
              </>
            ) : (
              <video
                className="w-full h-full"
                autoPlay
                controls
                src="/demo.mp4"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pl-8"
          >
            {/* Tag Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
                Platform Demo
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              See How It Works
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Experience our interactive learning platform in action. Watch how we combine AI-powered education with blockchain technology to create a truly inclusive learning environment.
            </p>
            <div className="space-y-4">
              {[
                "Interactive AI-powered lessons",
                "Real-time language translation",
                "Blockchain-verified certificates",
                "Accessibility features for all",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 