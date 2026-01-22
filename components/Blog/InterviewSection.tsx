"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

interface Question {
    id: string;
    question: string;
    answer: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    source?: string;
}

export default function InterviewSection() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const q = query(
                    collection(db, "interview_qna"),
                    orderBy("createdAt", "desc"),
                    limit(5) // Only show 5 latest questions
                );
                const snap = await getDocs(q);
                const data = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Question[];
                setQuestions(data);
            } catch (err) {
                console.error("Error fetching questions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (questions.length === 0) {
        return null; // Don't show section if no questions
    }

    return (
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        💡 Interview Q&A
                    </span>
                    <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                        Câu Hỏi Phỏng Vấn
                    </h2>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        Tổng hợp các câu hỏi phỏng vấn thực tế về AI, Machine Learning và Engineering
                    </p>
                </div>

                {/* Questions Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {questions.map((q) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`overflow-hidden rounded-xl border transition-all duration-300 ${openId === q.id
                                ? "bg-white border-indigo-200 shadow-lg dark:bg-gray-800 dark:border-indigo-500/30"
                                : "bg-white/60 border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-900/40 dark:border-gray-800 backdrop-blur-sm"
                                }`}
                        >
                            <div
                                onClick={() => setOpenId(openId === q.id ? null : q.id)}
                                className="cursor-pointer p-5"
                            >
                                <div className="mb-3 flex items-center gap-2 flex-wrap">
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase ${q.difficulty === "Easy"
                                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                                            : q.difficulty === "Medium"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300"
                                                : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                                            }`}
                                    >
                                        {q.difficulty}
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        #{q.topic}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                    {q.question}
                                </h3>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {openId === q.id ? "Ẩn câu trả lời" : "Xem câu trả lời"}
                                    </span>
                                    <FiChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform ${openId === q.id ? "rotate-180" : ""
                                            }`}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {openId === q.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 dark:border-gray-700/50 dark:bg-gray-900/30">
                                            <div
                                                className="prose prose-sm max-w-none dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300"
                                                dangerouslySetInnerHTML={{ __html: q.answer }}
                                            />
                                            {q.source && (
                                                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                        📚 Nguồn: {q.source.startsWith('http') ? (
                                                            <a
                                                                href={q.source}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                                                            >
                                                                {q.source}
                                                            </a>
                                                        ) : (
                                                            <span>{q.source}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* View All Link */}
                <div className="mt-10 text-center">
                    <Link
                        href="/interview"
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
                    >
                        Xem tất cả câu hỏi
                        <FiArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
