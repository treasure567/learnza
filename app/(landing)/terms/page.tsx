"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Users, CreditCard, Lock, AlertTriangle, Scale, Globe, BookOpen, Award } from "lucide-react";

export default function Terms() {
  const lastUpdated = "August 7th, 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block p-3 bg-green-100 rounded-full mb-6"
            >
              <FileText className="w-8 h-8 text-green-600" />
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
              className="text-xl text-gray-600 mb-4"
            >
              Please read these terms carefully before using our innovative learning platform.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              Last updated: {lastUpdated}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="prose prose-gray max-w-none">
                <div className="space-y-8">
                  {/* Agreement to Terms */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Scale className="w-6 h-6 text-green-600" />
                      1. Agreement to Terms
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      By accessing or using Learnza's learning platform, you agree to be bound by these Terms and Conditions, our Privacy Policy, and our Cookie Policy. These terms constitute a legally binding agreement between you and Learnza.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      If you do not agree to these terms, you must not use our platform. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of any changes.
                    </p>
                  </motion.div>

                  {/* User Accounts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Users className="w-6 h-6 text-green-600" />
                      2. User Accounts and Registration
                    </h2>
                    <p className="text-gray-700 mb-4">
                      When you create an account with us, you must provide accurate, current, and complete information. You are responsible for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Account Security:</strong> Maintaining the security and confidentiality of your account credentials</li>
                      <li><strong>Account Activity:</strong> All activities that occur under your account, whether authorized or not</li>
                      <li><strong>Password Protection:</strong> Keeping your password confidential and not sharing it with others</li>
                      <li><strong>Information Updates:</strong> Promptly updating your account information when it changes</li>
                      <li><strong>Account Access:</strong> Notifying us immediately of any unauthorized use of your account</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      You must be at least 13 years old to create an account. If you are under 18, you must have parental or guardian consent to use our platform.
                    </p>
                  </motion.div>

                  {/* User Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-green-600" />
                      3. User Content and Contributions
                    </h2>
                    <p className="text-gray-700 mb-4">
                      You retain ownership of any content you submit to the platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Use, reproduce, modify, and distribute your content on our platform</li>
                      <li>Display your content to other users for educational purposes</li>
                      <li>Use your content for platform improvement and analytics</li>
                      <li>Include your content in promotional materials (with attribution)</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      You represent and warrant that your content does not violate any third-party rights and complies with our content guidelines.
                    </p>
                  </motion.div>

                  {/* Intellectual Property */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Award className="w-6 h-6 text-green-600" />
                      4. Intellectual Property Rights
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      The Learnza platform, including its original content, features, functionality, and design, is owned by Learnza and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Our blockchain-verified credentials, AI algorithms, and educational content are proprietary to Learnza. You may not copy, reproduce, distribute, or create derivative works without our express written permission.
                    </p>
                  </motion.div>

                  {/* Payment Terms */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      5. Payment Terms and Subscriptions
                    </h2>
                    <p className="text-gray-700 mb-4">
                      For premium services and paid features, the following terms apply:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Payment Processing:</strong> Payments are processed securely through our authorized payment providers</li>
                      <li><strong>Subscription Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date</li>
                      <li><strong>Pricing Changes:</strong> We may change subscription prices with 30 days' notice</li>
                      <li><strong>Refunds:</strong> Refunds are subject to our refund policy and applicable laws</li>
                      <li><strong>Taxes:</strong> You are responsible for any applicable taxes on your purchases</li>
                      <li><strong>Currency:</strong> All prices are displayed in the local currency of your region</li>
                    </ul>
                  </motion.div>

                  {/* Prohibited Activities */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-green-600" />
                      6. Prohibited Activities
                    </h2>
                    <p className="text-gray-700 mb-4">
                      You may not use our platform for any illegal or unauthorized purpose. Prohibited activities include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Illegal Activities:</strong> Using the platform for any illegal purpose or to violate laws</li>
                      <li><strong>Account Sharing:</strong> Sharing account credentials or allowing unauthorized access</li>
                      <li><strong>Security Violations:</strong> Attempting to gain unauthorized access to our systems</li>
                      <li><strong>Malicious Content:</strong> Uploading viruses, malware, or other harmful content</li>
                      <li><strong>Spam and Harassment:</strong> Sending spam, harassing other users, or creating fake accounts</li>
                      <li><strong>Content Violations:</strong> Posting inappropriate, offensive, or copyrighted content</li>
                      <li><strong>Platform Abuse:</strong> Attempting to disrupt or interfere with platform operations</li>
                    </ul>
                  </motion.div>

                  {/* Termination */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Lock className="w-6 h-6 text-green-600" />
                      7. Account Termination and Suspension
                    </h2>
                    <p className="text-gray-700 mb-4">
                      We may terminate or suspend your account and access to the platform in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Terms Violation:</strong> Violation of these terms or our policies</li>
                      <li><strong>Fraudulent Activity:</strong> Engaging in fraudulent or illegal activities</li>
                      <li><strong>Platform Abuse:</strong> Misusing platform features or resources</li>
                      <li><strong>Payment Issues:</strong> Non-payment of fees or chargeback disputes</li>
                      <li><strong>Legal Requirements:</strong> Compliance with legal obligations or court orders</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      Upon termination, your right to use the platform ceases immediately, and we may delete your account and data in accordance with our data retention policies.
                    </p>
                  </motion.div>

                  {/* Limitation of Liability */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-600" />
                      8. Limitation of Liability and Disclaimers
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      To the maximum extent permitted by law, Learnza shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Loss of profits, data, or business opportunities</li>
                      <li>Interruption of service or platform downtime</li>
                      <li>Errors or inaccuracies in educational content</li>
                      <li>Third-party actions or content</li>
                      <li>Security breaches or data loss</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      Our total liability to you for any claims arising from these terms shall not exceed the amount you paid us in the 12 months preceding the claim.
                    </p>
                  </motion.div>

                  {/* Privacy and Data */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">9. Privacy and Data Protection</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy and Cookie Policy, which are incorporated into these terms by reference.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By using our platform, you consent to the collection and use of your information as described in our privacy policies.
                    </p>
                  </motion.div>

                  {/* Blockchain and Tokens */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">10. Blockchain Technology and Tokens</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Our platform uses blockchain technology for credential verification and token rewards. By using these features, you acknowledge:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Blockchain transactions are irreversible and subject to network conditions</li>
                      <li>Token values may fluctuate and are not guaranteed</li>
                      <li>You are responsible for the security of your wallet and private keys</li>
                      <li>We are not responsible for losses due to blockchain network issues</li>
                    </ul>
                  </motion.div>

                  {/* Changes to Terms */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">11. Changes to Terms</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to modify these terms at any time. When we make material changes, we will:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Update the "Last Updated" date at the top of these terms</li>
                      <li>Notify users through our platform or email</li>
                      <li>Provide a summary of significant changes</li>
                      <li>Give users an opportunity to review and accept new terms</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      Your continued use of the platform after changes become effective constitutes acceptance of the new terms.
                    </p>
                  </motion.div>

                  {/* Governing Law */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">12. Governing Law and Disputes</h2>
                    <p className="text-gray-700 leading-relaxed">
                      These terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from these terms or your use of the platform shall be resolved through binding arbitration in accordance with our dispute resolution procedures.
                    </p>
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="space-y-4 bg-gray-50 p-6 rounded-xl"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                    <p className="text-gray-700 leading-relaxed">
                      For questions about these Terms and Conditions, please contact us:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Email:</strong> legal@learnza.net.ng</p>
                      <p><strong>Subject Line:</strong> Terms and Conditions Inquiry</p>
                      <p><strong>Response Time:</strong> We aim to respond to all legal inquiries within 5 business days.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}