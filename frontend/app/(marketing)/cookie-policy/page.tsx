"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
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
              <Cookie className="w-8 h-8 text-blue-600" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              Cookie Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600"
            >
              Understanding how and why we use cookies to improve your experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-blue">
            <div className="bg-white rounded-2xl p-8">
              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:
              </p>
              <ul>
                <li>Remembering your preferences</li>
                <li>Understanding how you use our platform</li>
                <li>Providing personalized content</li>
                <li>Improving our services</li>
              </ul>

              <h2>Types of Cookies We Use</h2>
              
              <h3>Essential Cookies</h3>
              <p>
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>

              <h3>Performance Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>

              <h3>Functionality Cookies</h3>
              <p>
                These cookies enable the website to provide enhanced functionality and personalization based on your preferences and choices.
              </p>

              <h3>Targeting Cookies</h3>
              <p>
                These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant content.
              </p>

              <h2>Managing Cookies</h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
              </p>

              <h3>Browser Settings</h3>
              <p>
                Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser. Here are some common approaches:
              </p>
              <ul>
                <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
                <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                <li>Safari: Preferences → Privacy → Cookies and website data</li>
              </ul>

              <h2>Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about our Cookie Policy, please contact us at:
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