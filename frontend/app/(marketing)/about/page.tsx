"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui";
import { ArrowRight, Users, Target, Award, Sparkles } from "lucide-react";
import DemoVideo from "@/app/components/landing/DemoVideo";

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
      title: "Community-Driven",
      description: "Building a supportive learning environment where everyone can thrive.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal-Oriented",
      description: "Focused on helping our users achieve their learning objectives effectively.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Education",
      description: "Delivering high-quality, verified educational content and resources.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Innovation",
      description: "Continuously improving our platform with cutting-edge technology.",
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
              Transforming Education Through Technology
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              We're on a mission to make quality education accessible to everyone, everywhere.
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">
              The principles that guide us in creating the best learning experience for our users.
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
                    Join Us in Shaping the Future of Education
                  </h2>
                  <p className="text-green-100 mb-8">
                    Start your learning journey today and be part of our growing community.
                  </p>
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="bg-white text-green-800 hover:bg-green-50">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
      {/* FAQs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Find answers to common questions about our platform and services.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  question: "How does the AI-powered learning work?",
                  answer: "Our AI system adapts to your learning style and pace, providing personalized content and recommendations based on your progress and preferences."
                },
                {
                  question: "Are the certificates blockchain-verified?",
                  answer: "Yes, all certificates issued through our platform are stored on the blockchain, ensuring they are tamper-proof and globally verifiable."
                },
                {
                  question: "What languages are supported?",
                  answer: "We support multiple languages with real-time translation features, making our platform accessible to learners worldwide."
                },
                {
                  question: "Is the platform accessible for users with disabilities?",
                  answer: "Absolutely! We've built our platform with accessibility in mind, including screen reader support, keyboard navigation, and other assistive technologies."
                },
                {
                  question: "How much does it cost to use the platform?",
                  answer: "We offer both free and premium plans. The free plan includes basic features, while premium plans unlock advanced features and unlimited access."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}