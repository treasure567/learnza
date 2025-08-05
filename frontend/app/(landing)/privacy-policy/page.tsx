"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Users, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "December 15, 2024";

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
              <Shield className="w-8 h-8 text-green-600" />
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
              className="text-xl text-gray-600 mb-4"
            >
              We care about your privacy and are committed to protecting your personal data.
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
                  {/* Introduction */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Globe className="w-6 h-6 text-green-600" />
                      Introduction
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      At Learnza, we believe that privacy is a fundamental human right. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our innovative learning platform. We are committed to transparency and ensuring that you understand how your data is handled.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      This policy applies to all users of our platform, including learners, educators, and administrators. By using our services, you agree to the collection and use of information in accordance with this policy.
                    </p>
                  </motion.div>

                  {/* Information We Collect */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Database className="w-6 h-6 text-green-600" />
                      Information We Collect
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
                        <p className="text-gray-700 mb-3">We may collect personal information that you provide to us, including but not limited to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li>Full name and contact information (email, phone number)</li>
                          <li>Account credentials and authentication data</li>
                          <li>Payment and billing information</li>
                          <li>Educational history, preferences, and learning goals</li>
                          <li>Profile information and preferences</li>
                          <li>Communication preferences and settings</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Information</h3>
                        <p className="text-gray-700 mb-3">We automatically collect certain information about your device and how you interact with our platform, including:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li>Device information (IP address, browser type, operating system)</li>
                          <li>Log data and analytics</li>
                          <li>Usage patterns and learning behavior</li>
                          <li>Performance data and error logs</li>
                          <li>Session information and cookies</li>
                          <li>Geographic location data (with consent)</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Blockchain Data</h3>
                        <p className="text-gray-700 mb-3">As part of our blockchain-verified credential system, we may collect:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li>Wallet addresses (if you choose to connect a wallet)</li>
                          <li>Transaction hashes for credential verification</li>
                          <li>Certificate metadata and achievement records</li>
                          <li>Token earning and reward data</li>
              </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* How We Use Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Users className="w-6 h-6 text-green-600" />
                      How We Use Your Information
                    </h2>
                    <p className="text-gray-700 mb-4">We use the information we collect for the following purposes:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Service Provision:</strong> Provide and maintain our learning platform and services</li>
                      <li><strong>Personalization:</strong> Personalize your learning experience and content recommendations</li>
                      <li><strong>AI Enhancement:</strong> Improve our AI-powered learning algorithms and features</li>
                      <li><strong>Communication:</strong> Send you updates, notifications, and educational content</li>
                      <li><strong>Support:</strong> Provide customer support and technical assistance</li>
                      <li><strong>Analytics:</strong> Analyze usage patterns to improve our platform</li>
                      <li><strong>Security:</strong> Ensure platform security and prevent fraud</li>
                      <li><strong>Compliance:</strong> Comply with legal obligations and regulations</li>
              </ul>
                  </motion.div>

                  {/* Information Sharing */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Eye className="w-6 h-6 text-green-600" />
                      Information Sharing and Disclosure
                    </h2>
                    <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in platform operations</li>
                      <li><strong>Educational Partners:</strong> With educational institutions and partners for credential verification</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                      <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>
                    <p className="text-gray-700 mt-4">
                      We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                    </p>
                  </motion.div>

                  {/* Data Security */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Lock className="w-6 h-6 text-green-600" />
                      Data Security and Protection
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      We implement comprehensive technical and organizational measures to protect your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>End-to-end encryption for sensitive data transmission</li>
                      <li>Secure data centers with physical and digital security measures</li>
                      <li>Regular security audits and vulnerability assessments</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Data backup and disaster recovery procedures</li>
                      <li>Employee training on data protection and privacy</li>
              </ul>
                    <p className="text-gray-700 mt-4">
                      While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but we continuously work to improve our security measures.
                    </p>
                  </motion.div>

                  {/* Your Rights */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-600" />
                      Your Privacy Rights
                    </h2>
                    <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Access:</strong> Request access to your personal information</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                      <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                      <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                      <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                      <li><strong>Withdrawal:</strong> Withdraw consent for data processing where applicable</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      To exercise these rights, please contact us using the information provided below.
                    </p>
                  </motion.div>

                  {/* Cookies and Tracking */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Remember your preferences and settings</li>
                      <li>Analyze platform usage and performance</li>
                      <li>Provide personalized content and recommendations</li>
                      <li>Ensure platform security and prevent fraud</li>
              </ul>
                    <p className="text-gray-700 mt-4">
                      You can control cookie settings through your browser preferences. However, disabling certain cookies may affect platform functionality.
                    </p>
                  </motion.div>

                  {/* International Transfers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">International Data Transfers</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                    </p>
                  </motion.div>

                  {/* Children's Privacy */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                    </p>
                  </motion.div>

                  {/* Changes to Policy */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date.
                    </p>
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="space-y-4 bg-gray-50 p-6 rounded-xl"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                    <p className="text-gray-700 leading-relaxed">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Email:</strong> privacy@learnza.net.ng</p>
                      <p><strong>Address:</strong> Learnza Privacy Team, [Your Address]</p>
                      <p><strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days.</p>
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