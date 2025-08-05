"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Globe, Award, Sparkles } from "lucide-react";
import CountUp from "react-countup";

export default function Stats() {
  const stats = [
    { icon: <Users className="w-6 h-6" />, value: 10000, suffix: "+", label: "Active Learners" },
    { icon: <Globe className="w-6 h-6" />, value: 50, suffix: "+", label: "Countries" },
    { icon: <Award className="w-6 h-6" />, value: 100000, suffix: "+", label: "Certificates Issued" },
    { icon: <Sparkles className="w-6 h-6" />, value: 95, suffix: "%", label: "Success Rate" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tag Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
            Our Impact
          </span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex justify-center text-green-600 mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2.5}
                  delay={index * 0.2}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 