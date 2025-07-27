"use client";

import React from "react";
import { Button } from "./components/ui";
import { motion } from "framer-motion";
import { Blocks, Brain, Award, Coins, Languages, Users } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Interactive Learning System",
      description:
        "Intelligent modules with animations, voice, and sign language support for an immersive learning experience.",
    },
    {
      icon: <Users className="w-8 h-8 text-secondary" />,
      title: "Accessibility for All",
      description:
        "Support for hearing impaired, visually impaired, and neurodiverse learners through AI-powered tools.",
    },
    {
      icon: <Blocks className="w-8 h-8 text-accent" />,
      title: "Blockchain Credentials",
      description:
        "Secure, tamper-proof storage of certificates and CVs on the blockchain for instant verification.",
    },
    {
      icon: <Coins className="w-8 h-8 text-primary" />,
      title: "Learn-to-Earn Rewards",
      description:
        "Earn tokens for completing modules and maintaining consistent participation.",
    },
    {
      icon: <Award className="w-8 h-8 text-secondary" />,
      title: "Progress Tracking",
      description:
        "Comprehensive tracking of learning sessions, performance stats, and automated rewards.",
    },
    {
      icon: <Languages className="w-8 h-8 text-accent" />,
      title: "Cultural Inclusion",
      description:
        "Support for local languages and cultural contexts including Yoruba, Igbo, and Hausa.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-dark text-light px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
        </div>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Inclusive Interactive Learning
              <span className="text-primary"> & </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">
                Credential Blockchain
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-light/80 max-w-3xl mx-auto">
              An accessible learning platform that combines blockchain
              technology with interactive education to make learning available
              to everyone.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" size="lg">
                Start Learning
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-light">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Core Features
            </h2>
            <p className="text-text/80 text-lg max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with accessibility
              to create an inclusive learning environment for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 p-3 rounded-full bg-light-100 w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-dark text-light">
        <div className="container mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl mb-8 text-light/80 max-w-2xl mx-auto">
              Join our platform today and experience the future of inclusive
              education with blockchain-verified credentials.
            </p>
            <Button variant="secondary" size="lg">
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
