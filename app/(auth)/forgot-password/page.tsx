"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button, Input } from "@/app/components/ui";
import { ArrowLeft, Send } from "lucide-react";
import { useForgotPassword } from "@/lib/hooks/useAuth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { mutate: requestReset, isPending } = useForgotPassword();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    requestReset(email);
  };

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
            <Link 
              href="/signin" 
              className="inline-flex items-center text-sm text-green-700 hover:text-green-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900"
            >
              Reset your password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-gray-600"
            >
              Enter your email address and we'll send you instructions to reset your password.
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              loading={isPending}
              disabled={!email}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              Send reset instructions
              <Send className="w-4 h-4" />
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}