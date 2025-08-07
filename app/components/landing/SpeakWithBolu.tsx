'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui';
import { Phone, Bot, Sparkles } from 'lucide-react';
import { BoluCallModal } from '../ui/bolu-call-modal';

export default function SpeakWithBolu() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-green-50 to-white">
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-600 bg-green-50 px-4 py-1 rounded-full">
              AI-Powered Assistant
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Have Questions? Talk to Bolu AI
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            Get instant answers and guidance through a phone call with Bolu, our AI assistant.
            Available 24/7 to explain everything about our platform and help you succeed.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Bolu AI Now
            </Button>
          
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-1/2 bg-green-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-1/2 bg-green-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <BoluCallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setIsModalOpen(false);
          // Additional confirmation handling if needed
        }}
      />
    </section>
  );
}
