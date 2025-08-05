"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block p-3 bg-blue-100 rounded-full mb-6"
            >
              <Shield className="w-8 h-8 text-blue-600" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              Privacy Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600"
            >
              We care about your privacy and are committed to protecting your personal data.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-blue">
            <div className="bg-white rounded-2xl p-8">
              <h2>Introduction</h2>
              <p>
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>

              <h2>Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We may collect personal information that you provide to us, including but not limited to:</p>
              <ul>
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Educational history and preferences</li>
              </ul>

              <h3>Usage Information</h3>
              <p>We automatically collect certain information about your device and how you interact with our platform, including:</p>
              <ul>
                <li>Device information</li>
                <li>Log data</li>
                <li>Usage patterns</li>
                <li>Performance data</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Personalize your learning experience</li>
                <li>Process your transactions</li>
                <li>Send you updates and communications</li>
                <li>Improve our platform</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>Service providers</li>
                <li>Educational partners</li>
                <li>Legal authorities when required</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@learnza.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}