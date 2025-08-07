"use client";

import {
  Menu,
  X,
  Bell,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { WalletSection } from "../../components/shared/WalletSection";
import { WalletConfirmationModal } from "../../components/ui/wallet-confirmation-modal";
import { useRouter } from "next/navigation";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import Sidebar from "@/app/components/dashboard/Sidebar";
import { Button } from "@/app/components/ui";

export default function UserboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sidebar is closed by default on small screens, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const { open } = useWeb3Modal();
  const pathname = usePathname();

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/signin");
    setShowLogoutModal(false);
  };

  // Handle wallet connection
  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleWalletConfirm = () => {
    setShowWalletModal(false);
    open();
  };

  // Open/close sidebar based on viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSidebarOpen(("matches" in e ? e.matches : (e as MediaQueryList).matches));
    };
    // Initialize
    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange as (ev: MediaQueryListEvent) => void);
    return () => {
      mediaQuery.removeEventListener("change", handleChange as (ev: MediaQueryListEvent) => void);
    };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Always render layout, let middleware handle redirect
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-[400px] mx-4"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-red-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                      <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Confirm Logout</h2>
                  <p className="text-gray-700">
                    Are you sure you want to log out? You'll need to sign in again to
                    access your account.
                  </p>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                      Logout
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowLogoutModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Confirmation Modal */}
      <WalletConfirmationModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConfirm={handleWalletConfirm}
      />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/95">
          <div className="flex h-[72px] items-center justify-between px-8">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <WalletSection onConnectWallet={handleConnectWallet} />

              <div className="flex items-center space-x-3">
                <button className="p-2.5 rounded-lg text-gray-600 bg-gray-100 hover:text-gray-900 transition-colors relative">
                  <Bell className="w-5 h-5 mr-2" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center space-x-3">
                  <img
                    src="https://tapback.co/api/avatar/user1.webp"
                    alt="User Avatar"
                    className="w-9 h-9 rounded-full border-2 border-white hover:border-green-200 transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 md:p-10">{children}</main>
      </div>
    </div>
  );
}
