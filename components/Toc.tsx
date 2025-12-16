"use client";

import Link from "next/link";
import { useState } from "react";

export interface HeadingItem {
  id: string;
  text: string;
  level: number; // 2 hoặc 3
  uid?: string;
}

export default function Toc({ headings }: { headings: HeadingItem[] }) {
  const [active, setActive] = useState<string>("");

  return (
    <nav className="toc-inner overflow-auto">
      <ul>
        {headings.map((h) => (
          <li
            key={h.uid ?? h.id}
            className="mt-4 text-lg text-gray-400 hover:text-indigo-400"
            style={{ paddingLeft: h.level === 3 ? "1rem" : 0, color: h.id === active ? "#6366f1" : "" }}
            onClick={() => setActive(h.id)}
          >
            <Link href={`#${h.id}`}>{h.text}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
