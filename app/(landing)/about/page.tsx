"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui";
import { ArrowRight, Users, Target, Award, Sparkles } from "lucide-react";
import DemoVideo from "@/app/components/landing/DemoVideo";
import FAQ from "@/app/components/landing/FAQ";

export default function About() {
  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Countries", value: "50+" },
    { label: "Success Rate", value: "95%" },
    { label: "Certifications", value: "100K+" },
  ];

  const values = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Advanced artificial intelligence that adapts to your learning style, provides personalized content, and offers real-time assistance in multiple languages.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Blockchain Verification",
      description: "Tamper-proof digital credentials stored on the blockchain, ensuring your achievements are globally verifiable and permanently secure.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Inclusive Education",
      description: "Accessibility features including sign language support, screen readers, and voice commands to make learning accessible to everyone.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Token Rewards",
      description: "Earn cryptocurrency tokens for learning achievements, creating a gamified experience that motivates continuous education.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
                About Learnza
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              Revolutionizing Education with AI & Blockchain
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              We're pioneering the future of education by combining artificial intelligence with blockchain technology to create a truly inclusive, verifiable, and personalized learning experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-green-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Technology</h2>
            <p className="text-gray-600">
              Discover how we're leveraging cutting-edge AI and blockchain technology to revolutionize education.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 p-8 rounded-2xl"
                >
                  <div                   className="text-green-800 mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Demo Video Section */}
      <DemoVideo />
      {/* CTA Section */}
      <section className="py-16 bg-green-800">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                              <h2 className="text-3xl font-bold text-white mb-6">
              Experience the Future of Learning Today
            </h2>
            <p className="text-green-100 mb-8">
              Join thousands of learners who are already benefiting from AI-powered education and blockchain-verified credentials.
            </p>
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="bg-white text-green-800 hover:bg-green-50">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5 mr-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
      {/* FAQs Section */}
      <FAQ />
    </div>
  );
}
