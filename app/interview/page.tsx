"use client";

import { useState, useEffect } from "react";
import { SoftBackground, PageHead } from "@/components/Soft/Soft";
import { QuestionCard } from "@/components/Blog/InterviewSection";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiSearch, FiBookOpen, FiLock } from "react-icons/fi";

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
    source?: string;
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
            <main className="st-home st-page min-h-[70vh]">
                <SoftBackground />
                <div className="st-wrap pt-32">
                    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
                        <div className="h-4 w-40 rounded-full bg-st-line" />
                        <div className="h-14 w-2/3 rounded-2xl bg-st-line" />
                        <div className="h-24 w-full rounded-3xl bg-st-line" />
                    </div>
                </div>
            </main>
        );
    }

    // Show maintenance page if not public and user is not admin
    if (!isPublic && !isAdmin) {
        return (
            <main className="st-home st-page flex min-h-[80vh] items-center">
                <SoftBackground />
                <div className="st-wrap py-24">
                    <div className="st-card mx-auto max-w-md p-10 text-center">
                        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                            <FiLock className="h-7 w-7" />
                        </div>
                        <h1 className="st-h2">Đang <em>bảo trì</em></h1>
                        <p className="st-body">Thư viện câu hỏi phỏng vấn đang được cập nhật. Bạn quay lại sau nhé!</p>
                        <Link href="/" className="st-btn primary mt-4">Về trang chủ</Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="st-home st-page min-h-screen pb-24">
            <SoftBackground />
            <PageHead
                label="~/interview"
                title="Thư viện"
                accent="phỏng vấn."
                subtitle={<>Tổng hợp <b>{questions.length}</b> câu hỏi phỏng vấn thực tế về AI, Machine Learning, RAG và Engineering.</>}
            />

            <div className="st-wrap">
                <div className="flex flex-col gap-10 lg:flex-row">
                    {/* topics */}
                    <aside className="w-full flex-shrink-0 lg:w-64">
                        <div className="lg:sticky lg:top-24">
                            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-widest text-st-muted">chủ đề</p>
                            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
                                {[["All", questions.length] as [string, number], ...sortedTopics.map((t) => [t, topicsMap[t]] as [string, number])].map(([topic, count]) => {
                                    const active = selectedTopic === topic;
                                    return (
                                        <button
                                            key={topic}
                                            onClick={() => setSelectedTopic(topic)}
                                            className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition ${active
                                                ? "border-transparent bg-st-ink text-st-bg dark:bg-gradient-to-r dark:from-lavender-300 dark:to-rose-300 dark:text-plum-950"
                                                : "border-st-line bg-st-surface text-st-muted hover:border-indigo-400 hover:text-st-ink"
                                                }`}
                                        >
                                            <span>{topic === "All" ? "Tất cả" : topic}</span>
                                            <span className="font-mono text-xs opacity-70">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="relative mb-8">
                            <FiSearch className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-st-muted" />
                            <input
                                type="search"
                                placeholder="Tìm câu hỏi (vd: RAG, Transformer…)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="st-input !pl-12"
                                aria-label="Tìm câu hỏi"
                            />
                        </div>

                        {loading ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="st-card h-36 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="st-card p-12 text-center">
                                <FiBookOpen className="mx-auto mb-3 h-8 w-8 text-st-muted" />
                                <p className="font-serif text-2xl italic text-st-ink">Không có câu hỏi nào khớp…</p>
                                <button
                                    onClick={() => { setSearchTerm(""); setSelectedTopic("All"); }}
                                    className="st-btn ghost mt-5"
                                >
                                    Xoá bộ lọc
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                key={selectedTopic + searchTerm}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 items-start gap-4 md:grid-cols-2"
                            >
                                {filteredQuestions.map((q) => (
                                    <motion.div layout id={`question-${q.id}`} key={q.id} variants={itemVariants}>
                                        <QuestionCard q={q} open={openIds.has(q.id)} onToggle={() => toggleQuestion(q.id)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
