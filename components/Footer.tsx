"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGithub, FiFacebook, FiMail, FiInstagram } from "react-icons/fi";

export default function Footer() {
  const pathname = usePathname();

  // Ẩn footer ở trang admin
  if (pathname?.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {/* Social Links */}
          <a
            href="https://github.com/nhitny"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="sr-only">GitHub</span>
            <FiGithub className="h-5 w-5" />
          </a>
          <a
            href="https://facebook.com/nhitny"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="sr-only">Facebook</span>
            <FiFacebook className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com/nhitny"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            <span className="sr-only">Instagram</span>
            <FiInstagram className="h-5 w-5" />
          </a>
          <a
            href="mailto:contact@nhitny.com"
            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span className="sr-only">Email</span>
            <FiMail className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Nhitny Blog. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              Made by <span className="font-semibold text-gray-600 dark:text-gray-300">Nhitny</span>
              <span className="animate-pulse text-red-500">❤️</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
