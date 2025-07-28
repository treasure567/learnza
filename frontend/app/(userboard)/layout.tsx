"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/app/components/theme-toggle";
import { useAuthStore } from "@/lib/store/auth";
import {
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  BookOpen,
} from "lucide-react";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Lessons",
    href: "/lessons",
    icon: BookOpen,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function UserboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/signin?from=${pathname}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-light-border dark:border-dark-border">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Learnza
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
                      : "text-text hover:bg-light-100 dark:text-text-light dark:hover:bg-dark-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-8 bg-primary dark:bg-primary-dark rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={() => logout()}
              className="flex items-center w-full px-3 py-2 text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 h-16 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100 lg:hidden"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Search Bar */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 bg-light-100 dark:bg-dark-100 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-text-muted" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100 md:hidden"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary dark:bg-primary-dark rounded-full" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-text dark:text-text-light">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary dark:text-primary-dark">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-light-border dark:border-dark-border md:hidden"
              >
                <div className="p-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-2 bg-light-100 dark:bg-dark-100 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                    />
                    <Search className="absolute right-3 top-2.5 w-5 h-5 text-text-muted" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page Content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
