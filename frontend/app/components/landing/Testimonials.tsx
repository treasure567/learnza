"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      avatar: "sarah",
      quote: "The blockchain certification feature is revolutionary. My credentials are now instantly verifiable by employers worldwide.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Student",
      avatar: "michael",
      quote: "As a visually impaired learner, Learnza's accessibility features have made learning programming actually enjoyable and effective.",
      rating: 5,
    },
    {
      name: "Aisha Patel",
      role: "Data Scientist",
      avatar: "aisha",
      quote: "The cultural inclusion and language support helped me learn in my native language while building global skills.",
      rating: 5,
    },
    {
      name: "David Okafor",
      role: "Product Manager",
      avatar: "david",
      quote: "The learn-to-earn model motivated me to complete courses consistently. I've earned while learning!",
      rating: 5,
    },
    {
      name: "Fatima Hassan",
      role: "UX Designer",
      avatar: "fatima",
      quote: "The interactive learning modules with voice and sign language support made complex topics accessible to everyone.",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Tech Lead",
      avatar: "james",
      quote: "Progress tracking and performance analytics helped me identify areas for improvement and accelerate my learning.",
      rating: 5,
    },
  ];

  const totalSlides = Math.ceil(testimonials.length / 2);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentIndex * 2;
    return testimonials.slice(startIndex, startIndex + 2);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:flex-1 mb-8 lg:mb-0"
          >
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
                Testimonials
              </span>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              What Our Learners Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Join thousands of satisfied learners who have transformed their education journey
            </p>
          </motion.div>

          {/* Navigation Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-green-200 transition-all duration-200 group"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-green-200 transition-all duration-200 group"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
            </button>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {getCurrentTestimonials().map((testimonial, index) => (
                <motion.div
                  key={`${currentIndex}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 relative hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200"
                >
                  <div className="absolute top-6 right-6 text-green-600">
                    <Quote className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="flex items-center mb-4">
                    <img
                      src={`https://tapback.co/api/avatar/${testimonial.avatar}.webp`}
                      alt={`${testimonial.name} avatar`}
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                      loading="lazy"
                    />
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{testimonial.quote}</p>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? "bg-green-600 w-6" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 