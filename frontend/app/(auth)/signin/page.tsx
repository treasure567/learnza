"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui";
import { ArrowRight } from "lucide-react";

export default function SignIn() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Banner */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src="/images/auth-banner.jpg"
            alt="Education Banner"
            fill
            className="object-cover rounded-tr-[60px] rounded-br-[60px]"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/80 rounded-tr-[60px] rounded-br-[60px]" />
          
          {/* Logo Overlay */}
          <div className="absolute bottom-8 left-8 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Learnza Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-white font-semibold">Learnza</p>
                <p className="text-green-50/70 text-sm">Inclusive Learning Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900"
            >
              Sign in to your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Don't have an account?{" "}
              <Link href="/signup" className="text-green-700 hover:text-green-800 font-medium">
                Sign up
              </Link>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600/20"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm text-green-700 hover:text-green-800">
                Forgot password?
              </Link>
            </div>

            <Button className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center gap-2">
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
