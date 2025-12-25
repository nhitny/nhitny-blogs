"use client";

// @ts-ignore
import TechBackground from "@/components/Layout/TechBackground";
import Link from "next/link";
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Hero() {
    return (
        <div className="relative overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
            <TechBackground />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-600 dark:text-indigo-300 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-2 animate-pulse"></span>
                        Welcome to my digital garden
                    </div>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 drop-shadow-sm">
                        Ghi lại hành trình <br />
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            AI, NLP & Tech
                        </span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Blog này là nơi mình lưu lại những kiến thức và trải nghiệm tìm hiểu được trong quá trình học tập. Mọi thứ là góc nhìn cá nhân và hành trình tự học, hy vọng sẽ giúp ích được cho bạn.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link
                            href="/blogs"
                            className="group relative rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all duration-300"
                        >
                            <span className="relative flex items-center gap-2">
                                Khám phá bài viết
                                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                            Về tác giả
                        </Link>
                    </div>

                    {/* Social Links */}
                    <div className="mt-12 flex justify-center gap-8 text-gray-500 dark:text-gray-400">
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all duration-300">
                            <FiGithub className="h-6 w-6" />
                        </a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all duration-300">
                            <FiLinkedin className="h-6 w-6" />
                        </a>
                        <a href="mailto:nhitny2802@gmail.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all duration-300">
                            <FiMail className="h-6 w-6" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom fade - adjusted for light/dark */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
        </div>
    );
}
