"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "../ui";

export default function CTA() {
  return (
    <section className="relative overflow-hidden">
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
            <div className="flex justify-center items-center">
              <Image
                src="/images/shoolboy-3d.png"
                alt="3D Schoolboy illustration"
                width={400}
                height={400}
                className="w-full max-w-md h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 