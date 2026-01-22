"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiSearch, FiHash, FiZap, FiBookOpen, FiGrid, FiLock } from "react-icons/fi";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

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

    // Access control
    const [isPublic, setIsPublic] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // Check access control
    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check if page is public
                const settingsRef = doc(db, "settings", "interview_qna");
                const settingsSnap = await getDoc(settingsRef);
                const pageIsPublic = settingsSnap.exists() ? (settingsSnap.data().isPublic ?? true) : true;
                setIsPublic(pageIsPublic);

                // Check if user is admin
                const unsub = onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        const userRef = doc(db, "users", user.uid);
                        const userSnap = await getDoc(userRef);
                        const userIsAdmin = userSnap.exists() && userSnap.data().role === "admin";
                        setIsAdmin(userIsAdmin);
                    }
                    setCheckingAccess(false);
                });

                return () => unsub();
            } catch (error) {
                console.error("Error checking access:", error);
                setCheckingAccess(false);
            }
        };

        checkAccess();
    }, []);

    // Handle URL query param
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const topicParam = params.get("topic");
            const idParam = params.get("id");

            if (topicParam) {
                setSelectedTopic(topicParam);
            }

            if (idParam) {
                setOpenIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(idParam);
                    return newSet;
                });

                // Wait for render then scroll
                setTimeout(() => {
                    const element = document.getElementById(`question-${idParam}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add highlight effect
                        element.classList.add('ring-2', 'ring-indigo-500');
                        setTimeout(() => element.classList.remove('ring-2', 'ring-indigo-500'), 2000);
                    }
                }, 500);
            }
        }
    }, [questions]);

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

    // Get unique topics and count
    const topicsMap = questions.reduce((acc, q) => {
        acc[q.topic] = (acc[q.topic] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedTopics = Object.keys(topicsMap).sort();

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

    // Show loading while checking access
    if (checkingAccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0c111d]">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-500">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    // Show maintenance page if not public and user is not admin
    if (!isPublic && !isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0c111d]">
                <div className="max-w-md text-center px-6">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                        <FiLock className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                        Trang đang bảo trì
                    </h1>
                    <p className="mb-8 text-gray-600 dark:text-gray-400">
                        Trang Interview Q&A hiện đang được cập nhật và tạm thời không khả dụng. Vui lòng quay lại sau!
                    </p>
                    <a
                        href="/"
                        className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Quay về trang chủ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 dark:bg-[#0c111d] transition-colors duration-300">

            {/* Decorative Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-[100px] dark:bg-purple-900/10"></div>
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-200/30 blur-[100px] dark:bg-indigo-900/10"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-pink-200/20 blur-[100px] dark:bg-pink-900/10"></div>
            </div>

            {/* Header Banner */}
            <div className="relative z-10 pt-20 pb-12">
                <div className="mx-auto max-w-7xl px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-500/20">
                            <FiZap className="h-4 w-4" /> Interview Prep
                        </span>
                        <h1 className="mb-6 text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Thư Viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Interview Q&A</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                            Tổng hợp <b>{questions.length}</b> câu hỏi phỏng vấn thực tế về AI, Machine Learning, RAG và Engineering giúp bạn tự tin chinh phục nhà tuyển dụng.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Sidebar - Topics (Glassmorphism) */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="rounded-2xl border border-gray-200/50 bg-white/70 backdrop-blur-xl p-6 shadow-xl dark:border-gray-800/50 dark:bg-gray-900/60 dark:shadow-2xl">
                                <h3 className="mb-6 flex items-center gap-2 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest text-opacity-70">
                                    <FiGrid /> Chủ Đề Phổ Biến
                                </h3>

                                <div className="flex flex-row overflow-x-auto pb-4 lg:flex-col lg:pb-0 gap-2 no-scrollbar">
                                    <button
                                        onClick={() => setSelectedTopic("All")}
                                        className={`group flex items-center justify-between whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${selectedTopic === "All"
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 transform scale-[1.02]"
                                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <FiHash className={selectedTopic === "All" ? "text-indigo-200" : "text-gray-400"} />
                                            Tất cả
                                        </span>
                                        <span className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-1.5 text-xs font-bold ${selectedTopic === "All"
                                            ? "bg-white/20 text-white"
                                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                            }`}>
                                            {questions.length}
                                        </span>
                                    </button>

                                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 lg:block hidden"></div>

                                    {sortedTopics.map((topic) => (
                                        <button
                                            key={topic}
                                            onClick={() => setSelectedTopic(topic)}
                                            className={`group flex items-center justify-between whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${selectedTopic === topic
                                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 transform scale-[1.02]"
                                                : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-white"
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {topic}
                                            </span>
                                            <span className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-1.5 text-xs font-bold ${selectedTopic === topic
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-gray-700 dark:group-hover:text-gray-300"
                                                }`}>
                                                {topicsMap[topic]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content */}
                    <main className="flex-1 min-w-0">
                        {/* Search Bar - Floating Glass */}
                        <div className="mb-8 relative group">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
                            <div className="relative">
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm câu hỏi (VD: RAG, Transformer, React...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-2xl border-0 bg-white py-4 pl-14 pr-6 shadow-xl shadow-indigo-50/50 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 dark:bg-gray-900/80 dark:text-white dark:shadow-none dark:placeholder:text-gray-500 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        {/* Questions List with Staggered Animation */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
                                    <div className="absolute top-0 h-16 w-16 rounded-full border-t-2 border-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
                                </div>
                                <p className="mt-6 text-gray-500 font-medium animate-pulse">Đang tải tri thức...</p>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-3xl border border-dashed border-gray-300 bg-white/50 p-16 text-center dark:border-gray-700 dark:bg-gray-900/30 backdrop-blur-sm"
                            >
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                    <FiBookOpen className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy kết quả</h3>
                                <p className="text-gray-500 mb-6">Không có câu hỏi nào khớp với từ khóa &ldquo;{searchTerm}&rdquo; hoặc chủ đề này.</p>
                                <button
                                    onClick={() => { setSearchTerm(""); setSelectedTopic("All") }}
                                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-indigo-700"
                                >
                                    Xóa bộ lọc & Thử lại
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={selectedTopic + searchTerm}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start"
                            >
                                {filteredQuestions.map((q) => (
                                    <motion.div
                                        layout
                                        id={`question-${q.id}`}
                                        key={q.id}
                                        variants={itemVariants}
                                        className={`group overflow-hidden rounded-2xl border transition-all duration-300 
                      ${openIds.has(q.id)
                                                ? "bg-white border-indigo-200 shadow-xl shadow-indigo-100/50 dark:bg-gray-800 dark:border-indigo-500/30 dark:shadow-none transform scale-[1.01]"
                                                : "bg-white/60 border-gray-200 shadow-sm hover:shadow-md hover:bg-white hover:-translate-y-1 dark:bg-gray-900/40 dark:border-gray-800 dark:hover:bg-gray-800/80 backdrop-blur-md"
                                            }
                    `}
                                    >
                                        <div
                                            onClick={() => toggleQuestion(q.id)}
                                            className="flex cursor-pointer items-start justify-between p-6 md:p-7 relative"
                                        >
                                            {/* Side Highlight Bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${openIds.has(q.id) ? "bg-gradient-to-b from-indigo-500 to-purple-600" : "bg-transparent group-hover:bg-indigo-200 dark:group-hover:bg-gray-700"
                                                }`}></div>

                                            <div className="flex-1 pr-6 pl-2">
                                                <div className="mb-3 flex items-center gap-3 flex-wrap">
                                                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide uppercase shadow-sm
                            ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                                                            q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                                                                'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}
                         `}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 shadow-sm dark:bg-gray-700 dark:text-gray-300">
                                                        #{q.topic}
                                                    </span>
                                                </div>
                                                <h3 className={`text-xl font-bold leading-snug transition-colors ${openIds.has(q.id)
                                                    ? "text-indigo-700 dark:text-indigo-300"
                                                    : "text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                                    }`}>
                                                    {q.question}
                                                </h3>
                                            </div>
                                            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${openIds.has(q.id)
                                                ? "rotate-180 border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300"
                                                : "border-gray-200 bg-gray-50 text-gray-400 group-hover:border-indigo-200 group-hover:text-indigo-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500"
                                                }`}>
                                                <FiChevronDown className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {openIds.has(q.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <div className="border-t border-gray-100 dark:border-gray-700/50">
                                                        <div className="bg-gray-50/50 p-6 md:p-8 dark:bg-gray-900/30">
                                                            <div
                                                                className="prose prose-lg prose-indigo max-w-none dark:prose-invert 
                                    prose-headings:font-bold prose-headings:text-gray-800 dark:prose-headings:text-gray-100
                                    prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                                    prose-code:text-indigo-600 dark:prose-code:text-indigo-300
                                    prose-pre:bg-gray-900 dark:prose-pre:bg-black/50 prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700/50"
                                                                dangerouslySetInnerHTML={{ __html: q.answer }}
                                                            />
                                                        </div>
                                                        <div className="bg-gray-100/50 px-8 py-3 dark:bg-gray-800/50 flex justify-end">
                                                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                                Nhitny Blog • Interview Library
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
