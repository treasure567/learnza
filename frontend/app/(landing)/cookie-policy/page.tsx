"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cookie, Settings, Shield, Globe, Eye, Database, Smartphone, Monitor } from "lucide-react";

export default function CookiePolicy() {
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
              <Cookie className="w-8 h-8 text-green-600" />
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
              className="text-xl text-gray-600 mb-4"
            >
              Understanding how and why we use cookies and tracking technologies to enhance your learning experience.
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
                      What Are Cookies?
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Cookies are small text files that are stored on your device when you visit our website. These files contain information that helps us provide you with a better, more personalized learning experience. Cookies are essential for modern web applications and help us understand how you interact with our platform.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Our platform uses cookies and similar tracking technologies to enhance functionality, improve performance, and provide personalized content. This policy explains the types of cookies we use and how you can manage them.
                    </p>
                  </motion.div>

                  {/* How Cookies Help */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Settings className="w-6 h-6 text-green-600" />
                      How Cookies Enhance Your Experience
                    </h2>
                    <p className="text-gray-700 mb-4">Cookies help us provide you with a better experience by:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Personalization:</strong> Remembering your preferences and learning settings</li>
                      <li><strong>Performance:</strong> Optimizing page load times and platform responsiveness</li>
                      <li><strong>Security:</strong> Maintaining secure sessions and preventing unauthorized access</li>
                      <li><strong>Analytics:</strong> Understanding how you use our platform to improve features</li>
                      <li><strong>Functionality:</strong> Enabling advanced features like progress tracking and AI recommendations</li>
                      <li><strong>Accessibility:</strong> Remembering your accessibility preferences and settings</li>
                    </ul>
                  </motion.div>

                  {/* Types of Cookies */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Database className="w-6 h-6 text-green-600" />
                      Types of Cookies We Use
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Essential Cookies
                        </h3>
                        <p className="text-gray-700 mb-3">
                          These cookies are absolutely necessary for the website to function properly. They enable core functionality such as:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>User authentication and session management</li>
                          <li>Security features and fraud prevention</li>
                          <li>Basic platform functionality and navigation</li>
                          <li>Accessibility features and preferences</li>
                        </ul>
                        <p className="text-gray-600 text-sm mt-3">
                          <strong>Note:</strong> These cookies cannot be disabled as they are essential for platform operation.
                        </p>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-green-600" />
                          Performance Cookies
                        </h3>
                        <p className="text-gray-700 mb-3">
                          These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Page load times and performance metrics</li>
                          <li>User interaction patterns and behavior</li>
                          <li>Error tracking and debugging information</li>
                          <li>Platform usage statistics and analytics</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-green-600" />
                          Functionality Cookies
                        </h3>
                        <p className="text-gray-700 mb-3">
                          These cookies enable enhanced functionality and personalization based on your preferences:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Language preferences and regional settings</li>
                          <li>Learning progress and course preferences</li>
                          <li>UI customization and theme preferences</li>
                          <li>Notification settings and communication preferences</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-green-600" />
                          Analytics and Targeting Cookies
                        </h3>
                        <p className="text-gray-700 mb-3">
                          These cookies help us provide personalized content and improve our services:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                          <li>Content recommendations and personalization</li>
                          <li>Learning path optimization and suggestions</li>
                          <li>Feature usage analysis and improvement</li>
                          <li>Educational content relevance and targeting</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* Third-Party Cookies */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We may use third-party services that place their own cookies on your device. These services help us provide:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Analytics Services:</strong> Google Analytics, Mixpanel, or similar services for platform analytics</li>
                      <li><strong>Payment Processing:</strong> Stripe, PayPal, or other payment processors for secure transactions</li>
                      <li><strong>Content Delivery:</strong> CDN services for faster content delivery</li>
                      <li><strong>Customer Support:</strong> Support tools like Intercom or Zendesk</li>
                      <li><strong>Social Media:</strong> Social media integration and sharing features</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      These third-party services have their own privacy policies and cookie practices. We recommend reviewing their policies for more information.
                    </p>
                  </motion.div>

                  {/* Managing Cookies */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-green-600" />
                      Managing Your Cookie Preferences
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      You have full control over the cookies stored on your device. You can manage your cookie preferences through various methods:
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
                        <p className="text-gray-700 mb-3">Most browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                          <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                          <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                          <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                          <li><strong>Opera:</strong> Settings → Privacy & Security → Cookies and other site data</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Mobile Devices</h3>
                        <p className="text-gray-700 mb-3">For mobile devices, cookie management varies by browser and operating system:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li><strong>iOS Safari:</strong> Settings → Safari → Privacy & Security → Block All Cookies</li>
                          <li><strong>Android Chrome:</strong> Settings → Site Settings → Cookies</li>
                          <li><strong>Mobile Firefox:</strong> Menu → Settings → Privacy → Cookies</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Cookie Consent Management</h3>
                        <p className="text-gray-700 mb-3">Our platform provides a cookie consent banner that allows you to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li>Accept or decline non-essential cookies</li>
                          <li>Customize your cookie preferences</li>
                          <li>Update your preferences at any time</li>
                          <li>Withdraw consent for specific cookie categories</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* Impact of Disabling Cookies */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Impact of Disabling Cookies</h2>
                    <p className="text-gray-700 leading-relaxed">
                      While you can disable cookies, doing so may affect your experience on our platform:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Essential Features:</strong> Some core platform features may not work properly</li>
                      <li><strong>Personalization:</strong> You may lose personalized content and recommendations</li>
                      <li><strong>Progress Tracking:</strong> Learning progress and achievements may not be saved</li>
                      <li><strong>Performance:</strong> Page load times may be slower</li>
                      <li><strong>Security:</strong> Some security features may be compromised</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      We recommend keeping essential cookies enabled for the best learning experience.
                    </p>
                  </motion.div>

                  {/* Updates and Changes */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Updates to This Cookie Policy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make changes, we will:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Update the "Last Updated" date at the top of this policy</li>
                      <li>Notify users of significant changes through our platform</li>
                      <li>Provide clear information about what has changed</li>
                      <li>Give users an opportunity to review and accept new practices</li>
                    </ul>
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-4 bg-gray-50 p-6 rounded-xl"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                    <p className="text-gray-700 leading-relaxed">
                      If you have any questions about our Cookie Policy or how we use cookies, please contact us:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Email:</strong> privacy@learnza.net.ng</p>
                      <p><strong>Subject Line:</strong> Cookie Policy Inquiry</p>
                      <p><strong>Response Time:</strong> We aim to respond to all cookie-related inquiries within 48 hours.</p>
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