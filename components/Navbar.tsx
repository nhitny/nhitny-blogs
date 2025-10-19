"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar({ topics }: { topics?: any[] }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        pathname === href ? "bg-gray-800 text-white" : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/70 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-white">Bits-Of-Code</Link>
          <div className="hidden md:flex items-center gap-1">
            {link("/", "Home")}
            {link("/blogs", "Posts")}
            {link("/admin", "Admin")}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* theme toggle */}
          <button
            onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md border border-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-800"
          >
            {mounted && theme === "dark" ? "☀️" : "🌙"}
          </button>
          {/* login btn chỗ này nếu cần */}
        </div>
      </nav>
    </header>
  );
}
