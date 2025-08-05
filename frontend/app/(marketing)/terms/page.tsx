"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Terms() {
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
              <FileText className="w-8 h-8 text-blue-600" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              Terms and Conditions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600"
            >
              Please read these terms carefully before using our platform.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-blue">
            <div className="bg-white rounded-2xl p-8">
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or using Learnza, you agree to be bound by these Terms and Conditions and our Privacy Policy.
              </p>

              <h2>2. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate and complete information. You are responsible for:
              </p>
              <ul>
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Keeping your password confidential</li>
              </ul>

              <h2>3. User Content</h2>
              <p>
                You retain ownership of any content you submit to the platform. By submitting content, you grant us a license to:
              </p>
              <ul>
                <li>Use, modify, and distribute your content</li>
                <li>Display your content on our platform</li>
                <li>Use your content for promotional purposes</li>
              </ul>

              <h2>4. Intellectual Property</h2>
              <p>
                The platform and its original content, features, and functionality are owned by Learnza and are protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h2>5. Payment Terms</h2>
              <p>
                For paid services:
              </p>
              <ul>
                <li>Payments are processed securely through our payment providers</li>
                <li>Subscriptions will automatically renew unless cancelled</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>

              <h2>6. Prohibited Activities</h2>
              <p>
                You may not:
              </p>
              <ul>
                <li>Use the platform for any illegal purpose</li>
                <li>Share account credentials</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Upload malicious content</li>
              </ul>

              <h2>7. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the platform:
              </p>
              <ul>
                <li>For violations of these terms</li>
                <li>For fraudulent or illegal activities</li>
                <li>At our sole discretion</li>
              </ul>

              <h2>8. Limitation of Liability</h2>
              <p>
                Learnza shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the platform.
              </p>

              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes.
              </p>

              <h2>10. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at:
                <br />
                Email: legal@learnza.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}