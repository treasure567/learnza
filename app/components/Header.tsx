"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./ui";
import { Menu, X, Bell } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { WalletSection } from "../../components/shared/WalletSection";

interface HeaderProps {
  variant?: 'landing' | 'dashboard';
  onMenuClick?: () => void;
}

export default function Header({ variant = 'landing', onMenuClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user } = useAuthStore();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "About", href: "/about" },
    { label: "FAQs", href: "/#faqs" },
  ];

  if (variant === 'dashboard') {
    return (
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="flex h-[72px] items-center justify-between px-8">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <WalletSection />
            <button className="p-2.5 rounded-xl text-gray-600 bg-white/70 border border-gray-200 hover:bg-gray-100 transition-colors relative shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
            <img
              src="https://tapback.co/api/avatar/user1.webp"
              alt="User Avatar"
              className="w-9 h-9 rounded-full ring-2 ring-white hover:ring-green-200 transition-shadow cursor-pointer"
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-4xl">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <img
                  src="/images/logo.png"
                  alt="Learnza Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-2">
                  Learnza
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              <nav className="flex items-center space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-gray-700 hover:text-green-800 transition-colors text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/signin">
                <Button variant="secondary" className="text-green-800 hover:text-green-900 text-sm font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-green-800 hover:bg-green-900 text-white text-sm font-medium">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md rounded-b-2xl border-t border-gray-200/50"
            >
              <nav className="flex flex-col">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-gray-700 hover:text-green-800 hover:bg-gray-50/50 transition-colors px-6 py-3 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 px-4 py-4 border-t border-gray-200/50 mt-2">
                  <Link href="/signin" className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full text-green-800 hover:text-green-900 text-sm font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button className="w-full bg-green-800 hover:bg-green-900 text-white text-sm font-medium">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
} 
