"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiHash, FiCpu, FiCode, FiDatabase, FiGlobe, FiSmartphone, FiTerminal, FiServer, FiLayers, FiZap, FiWifi, FiCloud } from "react-icons/fi";

const randomIcons = [FiCpu, FiCode, FiDatabase, FiGlobe, FiSmartphone, FiTerminal, FiServer, FiLayers, FiZap, FiWifi, FiCloud];

const colors = [
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800",
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800",
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:border-fuchsia-800",
    "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800",
];

export default function TopicMarquee({ topics }: { topics: string[] }) {
    // If no topics, show some defaults to demonstrate ui
    const displayTopics = topics.length > 0 ? topics : [
        "AI", "Deep Learning", "React", "Next.js", "TypeScript",
        "Data Science", "Machine Learning", "Web Dev", "Python",
        "JavaScript", "TailwindCSS", "Firebase"
    ];

    // Duplicate for seamless loop
    const marqueeItems = [...displayTopics, ...displayTopics, ...displayTopics];

    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-transparent py-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-[#0A0A0A] to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-[#0A0A0A] to-transparent z-10"></div>

            <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] w-full">
                <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused] min-w-full">
                    {marqueeItems.map((topic, i) => {
                        const Icon = randomIcons[topic.length % randomIcons.length];
                        const colorClass = colors[topic.length % colors.length]; // Deterministic color based on length
                        return (
                            <Link
                                key={`${topic}-${i}`}
                                href={`/search?q=${encodeURIComponent(topic)}`}
                                className={`relative flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium backdrop-blur-sm transition-transform hover:scale-105 shadow-sm ${colorClass}`}
                            >
                                <Icon className="h-4 w-4 opacity-70" />
                                <span className="whitespace-nowrap">{topic}</span>
                            </Link>
                        );
                    })}
                </div>
                {/* Second copy for continuity - though duplicate mapped items above should cover it if screen width isn't huge compared to content */}
            </div>
        </div>
    );
}
