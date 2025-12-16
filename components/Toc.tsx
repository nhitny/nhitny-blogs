"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export interface HeadingItem {
  id: string;
  text: string;
  level: number; // 2 hoặc 3
  uid?: string;
}

export default function Toc({ headings }: { headings: HeadingItem[] }) {
  const [active, setActive] = useState<string>("");

  // Auto-detect active heading based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 100) {
          setActive(headings[i].id);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        📑 Nội dung bài viết
      </h3>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li
            key={h.uid ?? h.id}
            className={`relative transition-all ${h.level === 3 ? "pl-4" : ""
              }`}
            onClick={() => setActive(h.id)}
          >
            <Link
              href={`#${h.id}`}
              className={`block py-2 px-3 rounded text-sm transition-all ${h.id === active
                  ? "font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30 border-l-4 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-600 hover:text-indigo-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-800/50 border-l-4 border-transparent"
                }`}
            >
              {h.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
