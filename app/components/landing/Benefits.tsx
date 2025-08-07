"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Rocket, Globe } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Learning Path",
      description: "AI-driven customization that adapts to your learning style and pace.",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Fast-Track Certification",
      description: "Complete courses and get certified in record time with our efficient learning system.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Recognition",
      description: "Blockchain-verified certificates recognized by employers worldwide.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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
              Benefits
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Why Choose Learnza
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of education with our innovative platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="inline-block p-3 rounded-full bg-green-50 mb-4">
                <div className="text-green-600">{benefit.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 