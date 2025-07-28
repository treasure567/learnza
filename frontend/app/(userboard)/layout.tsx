"use client";

import {
  Home,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { Modal, Button } from "@/app/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/app/components/theme-toggle";
import { usePathname, useRouter } from "next/navigation";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/signin");
    setShowLogoutModal(false);
  };

  // Always render layout, let middleware handle redirect
  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <p className="text-text dark:text-text-light">
            Are you sure you want to log out? You'll need to sign in again to
            access your account.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-light-border dark:border-dark-border">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-xl font-semibold text-dark dark:text-light">
                Learnza
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark"
                    : "text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100"
                }`}
              >
                <link.icon className="w-5 h-5 mr-3" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={() => setShowLogoutModal(true)}
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
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-dark dark:text-light hidden sm:block">
                {sidebarLinks.find((link) => link.href === pathname)?.name ||
                  "Dashboard"}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-text dark:text-text-light hover:bg-light-100 dark:hover:bg-dark-100 md:hidden"
              >
                <Search className="w-6 h-6" />
              </button>
              <div className="relative hidden md:block w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 bg-light-100 dark:bg-dark-100 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:border-primary dark:focus:border-primary-dark"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-text-muted" />
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Search */}
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
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
