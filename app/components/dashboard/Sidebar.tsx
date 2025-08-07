"use client";

import {
  Home,
  LogOut,
  BookOpen,
  Book,
  Brain,
  Bot,
  Settings,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { usePathname, useRouter } from "next/navigation";

const mainNavLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Lessons",
    href: "/dashboard/lessons",
    icon: BookOpen,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: Book,
  },
];

const settingsLinks = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Help Center",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

interface SidebarProps {
  isSidebarOpen: boolean;
  onLogout: () => void;
}

export default function Sidebar({ isSidebarOpen, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 w-64 bg-white border-r border-gray-200`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-[72px] px-6 flex items-center border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/images/logo.png"
              alt="Learnza Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">
              Learnza
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-2">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  pathname === link.href
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className="w-5 h-5 mr-3" />
                <span className="text-sm">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Settings */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Settings</h3>
            <div className="space-y-1">
              {settingsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                    pathname === link.href
                      ? "bg-gray-100 text-gray-900 border border-gray-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <link.icon className="w-4 h-4 mr-3" />
                  <span className="text-sm">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
