"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Users,
  Blocks,
  Coins,
  Award,
  Languages,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Interactive Learning System",
      description:
        "Intelligent modules with animations, voice, and sign language support for an immersive learning experience.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accessibility for All",
      description:
        "Support for hearing impaired, visually impaired, and neurodiverse learners through AI-powered tools.",
    },
    {
      icon: <Blocks className="w-8 h-8" />,
      title: "Blockchain Credentials",
      description:
        "Secure, tamper-proof storage of certificates and CVs on the blockchain for instant verification.",
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Learn-to-Earn Rewards",
      description:
        "Earn tokens for completing modules and maintaining consistent participation.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Progress Tracking",
      description:
        "Comprehensive tracking of learning sessions, performance stats, and automated rewards.",
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "Cultural Inclusion",
      description:
        "Support for local languages and cultural contexts including Yoruba, Igbo, and Hausa.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50" id="features">
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
              Features
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Core Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with accessibility
            to create an inclusive learning environment for everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors h-full flex flex-col">
                <div className="mb-4 p-3 rounded-xl bg-green-50 w-fit">
                  <div className="text-green-600">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 flex-grow">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 