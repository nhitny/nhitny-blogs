"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi";

export default function ThemeToggle() {
      const [mounted, setMounted] = useState(false);
      const { theme, setTheme } = useTheme();

      useEffect(() => setMounted(true), []);

      if (!mounted) {
            return (
                  <button className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="sr-only">Toggle theme</span>
                        <div className="h-5 w-5" />
                  </button>
            );
      }

      const toggle = () => setTheme(theme === "light" ? "dark" : "light");

      return (
            <button
                  onClick={toggle}
                  className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400 transition-colors"
                  aria-label="Toggle Theme"
            >
                  {theme === "dark" ? <HiSun className="text-xl" /> : <HiMoon className="text-xl" />}
            </button>
      );
}
