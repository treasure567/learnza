"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./components/ui";
import {
  Blocks,
  Brain,
  Award,
  Coins,
  Languages,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Rocket,
  Globe,
  Star,
  Quote,
  Play,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Interactive Learning System",
      description:
        "Intelligent modules with animations, voice, and sign language support for an immersive learning experience.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accessibility for All",
      description:
        "Support for hearing impaired, visually impaired, and neurodiverse learners through AI-powered tools.",
    },
    {
      icon: <Blocks className="w-8 h-8" />,
      title: "Blockchain Credentials",
      description:
        "Secure, tamper-proof storage of certificates and CVs on the blockchain for instant verification.",
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Learn-to-Earn Rewards",
      description:
        "Earn tokens for completing modules and maintaining consistent participation.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Progress Tracking",
      description:
        "Comprehensive tracking of learning sessions, performance stats, and automated rewards.",
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "Cultural Inclusion",
      description:
        "Support for local languages and cultural contexts including Yoruba, Igbo, and Hausa.",
    },
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "10K+", label: "Active Learners" },
    { icon: <Globe className="w-6 h-6" />, value: "50+", label: "Countries" },
    { icon: <Award className="w-6 h-6" />, value: "100K+", label: "Certificates Issued" },
    { icon: <Sparkles className="w-6 h-6" />, value: "95%", label: "Success Rate" },
  ];

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

  const benefits = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Learning Path",
      description: "AI-driven customization that adapts to your learning style and pace.",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Fast-Track Certification",
      description: "Complete courses and get certified in record time with our efficient learning system.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Recognition",
      description: "Blockchain-verified certificates recognized by employers worldwide.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      image: "/testimonials/sarah.jpg",
      quote: "The blockchain certification feature is revolutionary. My credentials are now instantly verifiable by employers worldwide.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Student",
      image: "/testimonials/michael.jpg",
      quote: "As a visually impaired learner, Learnza's accessibility features have made learning programming actually enjoyable and effective.",
      rating: 5,
    },
    {
      name: "Aisha Patel",
      role: "Data Scientist",
      image: "/testimonials/aisha.jpg",
      quote: "The cultural inclusion and language support helped me learn in my native language while building global skills.",
      rating: 5,
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] pt-20 flex items-center justify-center overflow-hidden bg-white">
          {/* Subtle Green Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />

          {/* Content */}
          <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
                Inclusive Interactive
                <span className="block text-green-600">Learning Platform</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
                An accessible learning platform that combines blockchain
                technology with interactive education to make learning available
                to everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Learning
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto text-green-600 hover:bg-green-50"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Video Section */}
        <section className="py-16 bg-gray-50 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Video Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg"
              >
                {!isVideoPlaying ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <img
                      src="/demo-thumbnail.jpg"
                      alt="Platform Demo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors group"
                    >
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/90 group-hover:bg-white group-hover:scale-105 transition-all">
                        <Play className="w-6 h-6 text-green-600 group-hover:text-green-700" />
                      </div>
                    </button>
                  </>
                ) : (
                  <video
                    className="w-full h-full"
                    autoPlay
                    controls
                    src="/demo.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </motion.div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:pl-8"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                  See How It Works
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Experience our interactive learning platform in action. Watch how we combine AI-powered education with blockchain technology to create a truly inclusive learning environment.
                </p>
                <div className="space-y-4">
                  {[
                    "Interactive AI-powered lessons",
                    "Real-time language translation",
                    "Blockchain-verified certificates",
                    "Accessibility features for all",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center text-green-600 mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gray-50" id="features">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                Core Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with accessibility
                to create an inclusive learning environment for everyone.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors h-full flex flex-col">
                    <div className="mb-4 p-3 rounded-xl bg-green-50 w-fit">
                      <div className="text-green-600">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Updated Title */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                Why Choose Learnza
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the future of education with our innovative platform
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="inline-block p-3 rounded-full bg-green-50 mb-4">
                    <div className="text-green-600">{benefit.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                What Our Learners Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied learners who have transformed their education journey
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 relative"
                >
                  <div className="absolute top-6 right-6 text-green-600">
                    <Quote className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{testimonial.quote}</p>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Redesigned */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-green-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.2),_transparent_70%)]" />
          </div>
          
          <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center md:text-left"
              >
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white leading-tight">
                  Ready to Start Your Learning Journey?
                </h2>
                <p className="text-lg mb-8 text-green-50 opacity-90">
                  Join our platform today and experience the future of inclusive
                  education with blockchain-verified credentials.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-500 text-sm px-8"
                  >
                    Get Started Now
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden md:block"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: "Active Users", value: "10K+" },
                      { label: "Countries", value: "50+" },
                      { label: "Success Rate", value: "95%" },
                      { label: "Certifications", value: "100K+" },
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-green-50 opacity-80">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
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
      </main>
      <Footer />
    </>
  );
}
