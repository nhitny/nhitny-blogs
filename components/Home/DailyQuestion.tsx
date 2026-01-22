"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface Question {
    id: string;
    question: string;
    answer: string;
    topic: string;
    difficulty: string;
}

export default function DailyQuestion() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState<Question | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch questions on mount (get a handful to randomize locally)
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Fetch recent questions to keep it fresh
                const q = query(
                    collection(db, "interview_qna"),
                    orderBy("createdAt", "desc"),
                    limit(20)
                );
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));

                setQuestions(data);
                if (data.length > 0) {
                    // Pick random start
                    const random = data[Math.floor(Math.random() * data.length)];
                    setCurrentQ(random);
                }
            } catch (err) {
                console.error("Error fetching daily question:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleNextQuestion = () => {
        if (questions.length === 0) return;
        setShowAnswer(false);
        // Simple random pick
        const random = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQ(random);
    };

    if (loading) return null;
    if (!currentQ) return null; // No questions yet

    return (
        <div className="mx-auto mt-12 max-w-3xl px-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl">
                <div className="relative rounded-xl bg-white p-6 dark:bg-gray-900 md:p-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-lg">🔥</span>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                                Interview Question
                            </h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold
                        ${currentQ.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                    currentQ.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}
                     `}>
                                {currentQ.difficulty}
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {currentQ.topic}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 md:text-xl">
                            {currentQ.question}
                        </h3>
                    </div>

                    {/* Answer Section */}
                    <AnimatePresence>
                        {showAnswer && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: currentQ.answer }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                            onClick={() => setShowAnswer(!showAnswer)}
                            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            {showAnswer ? (
                                <>
                                    <FiChevronUp /> Ẩn đáp án
                                </>
                            ) : (
                                <>
                                    <FiChevronDown /> Xem đáp án
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleNextQuestion}
                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                        >
                            <FiRefreshCw /> Câu khác
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
