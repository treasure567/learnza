"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "How does the blockchain certification work?",
      answer: "Our blockchain certification system creates tamper-proof digital credentials that are instantly verifiable by employers. Each certificate is minted as a unique token on the blockchain, ensuring authenticity and permanence.",
    },
    {
      question: "What accessibility features are available?",
      answer: "We offer sign language support, screen reader compatibility, voice commands, customizable UI, and AI-powered learning assistants to ensure everyone can learn effectively regardless of their needs.",
    },
    {
      question: "How do I earn rewards while learning?",
      answer: "You earn tokens for completing lessons, maintaining streaks, helping others, and achieving milestones. These tokens can be used for premium content, certificates, or converted to other cryptocurrencies.",
    },
    {
      question: "Which languages are supported?",
      answer: "We currently support English, Yoruba, Igbo, Hausa, and several other languages. Our AI system can also provide real-time translations and cultural context for better understanding.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openFaqIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openFaqIndex === index && (
                <div className="px-6 py-4 text-gray-600 border-t border-gray-100">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 