"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./components/ui";
import { Blocks, Brain, Award, Coins, Languages, Users } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Interactive Learning System",
      description:
        "Intelligent modules with animations, voice, and sign language support for an immersive learning experience.",
      gradient:
        "from-primary/10 to-primary/5 dark:from-primary-dark/10 dark:to-primary-dark/5",
      iconColor: "text-primary dark:text-primary-dark",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accessibility for All",
      description:
        "Support for hearing impaired, visually impaired, and neurodiverse learners through AI-powered tools.",
      gradient:
        "from-secondary/10 to-secondary/5 dark:from-secondary-dark/10 dark:to-secondary-dark/5",
      iconColor: "text-secondary dark:text-secondary-dark",
    },
    {
      icon: <Blocks className="w-8 h-8" />,
      title: "Blockchain Credentials",
      description:
        "Secure, tamper-proof storage of certificates and CVs on the blockchain for instant verification.",
      gradient:
        "from-accent/10 to-accent/5 dark:from-accent-dark/10 dark:to-accent-dark/5",
      iconColor: "text-accent dark:text-accent-dark",
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Learn-to-Earn Rewards",
      description:
        "Earn tokens for completing modules and maintaining consistent participation.",
      gradient:
        "from-primary/10 to-primary/5 dark:from-primary-dark/10 dark:to-primary-dark/5",
      iconColor: "text-primary dark:text-primary-dark",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Progress Tracking",
      description:
        "Comprehensive tracking of learning sessions, performance stats, and automated rewards.",
      gradient:
        "from-secondary/10 to-secondary/5 dark:from-secondary-dark/10 dark:to-secondary-dark/5",
      iconColor: "text-secondary dark:text-secondary-dark",
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "Cultural Inclusion",
      description:
        "Support for local languages and cultural contexts including Yoruba, Igbo, and Hausa.",
      gradient:
        "from-accent/10 to-accent/5 dark:from-accent-dark/10 dark:to-accent-dark/5",
      iconColor: "text-accent dark:text-accent-dark",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:h-screen flex items-center justify-center overflow-hidden bg-dark text-light py-16 md:py-0">
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-dark opacity-[0.03] dark:bg-grid-light" />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-100/50 to-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 dark:from-primary-dark/10 dark:via-secondary-dark/10 dark:to-accent-dark/10" />

          {/* Animated Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-primary/20 dark:bg-primary-dark/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-[200px] sm:w-[250px] md:w-[300px] h-[200px] sm:h-[250px] md:h-[300px] bg-secondary/20 dark:bg-secondary-dark/20 rounded-full blur-3xl animate-pulse delay-300" />
            <div className="absolute bottom-1/3 left-1/4 w-[250px] sm:w-[300px] md:w-[400px] h-[250px] sm:h-[300px] md:h-[400px] bg-accent/20 dark:bg-accent-dark/20 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Inclusive Interactive Learning
              <span className="text-primary dark:text-primary-dark"> & </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-accent to-primary dark:from-secondary-dark dark:via-accent-dark dark:to-primary-dark">
                Credential Blockchain
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-light/80 max-w-3xl mx-auto px-4">
              An accessible learning platform that combines blockchain
              technology with interactive education to make learning available
              to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto backdrop-blur-sm bg-primary/90 hover:bg-primary"
                >
                  Start Learning
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto backdrop-blur-sm bg-light/90 hover:bg-light"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 bg-light dark:bg-dark relative">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-[0.03]" />
        <div className="container mx-auto max-w-7xl relative px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-light">
              Core Features
            </h2>
            <p className="text-base sm:text-lg text-text-muted dark:text-text-light/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with accessibility
              to create an inclusive learning environment for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                  style={{
                    background: `radial-gradient(circle at center, var(--tw-gradient-from), transparent 70%)`,
                  }}
                />
                <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-6 rounded-2xl hover:border-primary/20 dark:hover:border-primary-dark/20 transition-colors h-full">
                  <div
                    className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit`}
                  >
                    <div className={feature.iconColor}>{feature.icon}</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 text-dark dark:text-light">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-muted dark:text-text-light/70">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-primary to-dark text-light relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-[0.03]" />
        <div className="container mx-auto max-w-7xl text-center relative px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-light/80 max-w-2xl mx-auto">
              Join our platform today and experience the future of inclusive
              education with blockchain-verified credentials.
            </p>
            <Link href="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
