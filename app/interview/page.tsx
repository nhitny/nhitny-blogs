"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiSearch, FiFilter } from "react-icons/fi";

interface Question {
    id: string;
    question: string;
    answer: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
}

export default function InterviewPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const q = query(
                    collection(db, "interview_qna"),
                    orderBy("createdAt", "desc")
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

    // Get unique topics
    const topics = ["All", ...Array.from(new Set(questions.map((q) => q.topic)))];

    // Filter questions
    const filteredQuestions = questions.filter((q) => {
        const matchesTopic = selectedTopic === "All" || q.topic === selectedTopic;
        const matchesSearch =
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTopic && matchesSearch;
    });

    const toggleQuestion = (id: string) => {
        const newOpenIds = new Set(openIds);
        if (newOpenIds.has(id)) {
            newOpenIds.delete(id);
        } else {
            newOpenIds.add(id);
        }
        setOpenIds(newOpenIds);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-white py-12 shadow-sm dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-6 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                        Thư Viện Phỏng Vấn AI & NLP
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        Tổng hợp các câu hỏi phỏng vấn thường gặp về RAG, LLMs, Machine Learning và Engineering.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto mt-12 max-w-5xl px-6">
                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Topic Filter */}
                    <div className="flex flex-wrap gap-2">
                        {topics.map((t) => (
                            <button
                                key={t}
                                onClick={() => setSelectedTopic(t)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedTopic === t
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-4 text-gray-500">Đang tải câu hỏi...</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="rounded-lg bg-white p-12 text-center text-gray-500 dark:bg-gray-900">
                        Không tìm thấy câu hỏi nào phù hợp.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuestions.map((q) => (
                            <div
                                key={q.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div
                                    onClick={() => toggleQuestion(q.id)}
                                    className="flex cursor-pointer items-start justify-between p-6"
                                >
                                    <div className="flex-1 pr-6">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className={`rounded px-2 py-0.5 text-xs font-semibold
                        ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}
                     `}>
                                                {q.difficulty}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {q.topic}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {q.question}
                                        </h3>
                                    </div>
                                    <div className={`transition-transform duration-200 ${openIds.has(q.id) ? "rotate-180" : ""}`}>
                                        <FiChevronDown className="h-6 w-6 text-gray-400" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {openIds.has(q.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/50">
                                                <div
                                                    className="prose prose-sm max-w-none dark:prose-invert"
                                                    dangerouslySetInnerHTML={{ __html: q.answer }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
