"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import AuthForm from "@/app/components/auth/AuthForm";

export default function SignUp() {
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-tr-[60px] rounded-br-[60px]" />
          
          {/* Logo Overlay */}
          <div className="absolute bottom-8 left-8 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white backdrop-blur-sm rounded-lg flex items-center justify-center">
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
              Create your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Already have an account?{" "}
              <Link href="/signin" className="text-green-700 hover:text-green-800 font-medium">
                Sign in
              </Link>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AuthForm route="register" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
