"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export interface HeadingItem {
  id: string;
  text: string;
  level: number; // 1, 2 hoặc 3
  uid?: string;
}

export default function Toc({ headings }: { headings: HeadingItem[] }) {
  const [active, setActive] = useState<string>("");

  // highlight the heading currently at the top of the viewport
  useEffect(() => {
    const handleScroll = () => {
      const els = headings.map((h) => document.getElementById(h.id));
      for (let i = els.length - 1; i >= 0; i--) {
        const el = els[i];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(headings[i].id);
          return;
        }
      }
      setActive(headings[0]?.id || "");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="st-card st-toc" aria-label="Mục lục">
      <h3>mục lục · {headings.length}</h3>
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.uid ?? h.id} className={h.level === 3 ? "pl-4" : ""} onClick={() => setActive(h.id)}>
            <Link href={`#${h.id}`} className={h.id === active ? "is-active" : ""}>
              {h.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
