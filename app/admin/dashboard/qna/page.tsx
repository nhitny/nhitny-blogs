"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    collection,
    getDoc,
    getDocs,
    doc,
    orderBy,
    query,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import ConfirmModal from "@/components/UI/ConfirmModal";
import { FiHelpCircle, FiTrendingUp, FiLayers, FiTrash2, FiEdit, FiEye } from "react-icons/fi";

type Question = {
    id: string;
    question: string;
    answer: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    source?: string;
    views?: number;
    createdAt?: any;
};

export default function QnADashboard() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [mounted, setMounted] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalQuestions: 0,
        totalViews: 0,
        topicsCount: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
    });


    // Topics breakdown
    const [topicsBreakdown, setTopicsBreakdown] = useState<Record<string, number>>({});

    // Public visibility toggle
    const [isPublic, setIsPublic] = useState(true);
    const [togglingVisibility, setTogglingVisibility] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auth check
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                if (!user) {
                    router.replace("/admin/login");
                    return;
                }

                const uref = doc(db, "users", user.uid);
                const snap = await getDoc(uref);
                const role = snap.exists() ? (snap.data() as any).role : null;

                if (role !== "admin") {
                    await signOut(auth);
                    router.replace("/admin/login");
                    return;
                }

                await fetchQuestions();
            } finally {
                setCheckingAuth(false);
            }
        });
        return () => unsub();
    }, [router]);

    const fetchQuestions = async () => {
        setLoading(true);
        const q = query(collection(db, "interview_qna"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as Question[];

        setQuestions(data);
        calculateStats(data);

        // Fetch settings
        await fetchSettings();

        setLoading(false);
    };

    const fetchSettings = async () => {
        try {
            const settingsRef = doc(db, "settings", "interview_qna");
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                setIsPublic(settingsSnap.data().isPublic ?? true);
            } else {
                // Initialize if doesn't exist
                await setDoc(settingsRef, { isPublic: true });
                setIsPublic(true);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const toggleVisibility = async () => {
        setTogglingVisibility(true);
        try {
            const settingsRef = doc(db, "settings", "interview_qna");
            const newValue = !isPublic;
            await setDoc(settingsRef, { isPublic: newValue });
            setIsPublic(newValue);
        } catch (error) {
            console.error("Error toggling visibility:", error);
            alert("Lỗi khi cập nhật trạng thái!");
        } finally {
            setTogglingVisibility(false);
        }
    };

    const calculateStats = (questions: Question[]) => {
        let views = 0;
        const topics: Record<string, number> = {};
        let easy = 0, medium = 0, hard = 0;

        questions.forEach((q) => {
            views += q.views || 0;
            topics[q.topic] = (topics[q.topic] || 0) + 1;

            if (q.difficulty === "Easy") easy++;
            else if (q.difficulty === "Medium") medium++;
            else if (q.difficulty === "Hard") hard++;
        });

        setStats({
            totalQuestions: questions.length,
            totalViews: views,
            topicsCount: Object.keys(topics).length,
            easyCount: easy,
            mediumCount: medium,
            hardCount: hard,
        });
        setTopicsBreakdown(topics);
    };

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        questionId: "",
        questionText: "",
    });

    const handleDeleteClick = (id: string, question: string) => {
        setDeleteModal({ isOpen: true, questionId: id, questionText: question });
    };

    const onConfirmDelete = async () => {
        try {
            await deleteDoc(doc(db, "interview_qna", deleteModal.questionId));
            setDeleteModal((prev) => ({ ...prev, isOpen: false }));
            await fetchQuestions();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa câu hỏi!");
        }
    };

    if (!mounted) return null;

    if (checkingAuth) {
        return (
            <div className="mx-auto max-w-6xl p-6">
                <div className="p-10 text-center text-gray-400">Đang kiểm tra quyền…</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl p-6">
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Xóa câu hỏi"
                message={`Bạn có chắc chắn muốn xóa câu hỏi "${deleteModal.questionText}"? Hành động này không thể hoàn tác.`}
                onConfirm={onConfirmDelete}
                onCancel={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
            />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/dashboard"
                        className="mb-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ← Quay lại Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        🎯 Quản lý Interview Q&A
                    </h1>
                </div>
                <Link
                    href="/admin/qna/new"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/30"
                >
                    + Thêm câu hỏi
                </Link>
            </div>

            {/* Visibility Toggle */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-gray-700">
                            <FiEye className={`h-6 w-6 ${isPublic ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Trạng thái trang Interview
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isPublic ? (
                                    <span className="text-green-600 dark:text-green-400">✓ Đang hiển thị công khai</span>
                                ) : (
                                    <span className="text-orange-600 dark:text-orange-400">⚠ Đang ẩn (chỉ admin xem được)</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleVisibility}
                        disabled={togglingVisibility}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${isPublic ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${isPublic ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
                <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg dark:bg-emerald-900/20">
                            <FiHelpCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Q&A</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-green-500 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg dark:bg-green-900/20">
                            <span className="text-lg">✓</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Easy</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.easyCount}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-yellow-500 mb-2">
                        <div className="p-2 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                            <span className="text-lg">≈</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Medium</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mediumCount}</p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                        <div className="p-2 bg-red-50 rounded-lg dark:bg-red-900/20">
                            <span className="text-lg">⚡</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Hard</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hardCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Questions Table */}
                <div className="lg:col-span-3">
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Questions</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {questions.length} entries
                            </span>
                        </div>
                        {loading ? (
                            <div className="p-10 text-center text-gray-400">Loading data...</div>
                        ) : questions.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">Chưa có câu hỏi nào.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                                Question
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                                Topic
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                                Difficulty
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                                        {questions.map((q) => (
                                            <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 group transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-md">
                                                        <Link
                                                            href={`/interview?topic=${encodeURIComponent(q.topic)}&id=${q.id}`}
                                                            target="_blank"
                                                            className="hover:text-indigo-600 hover:underline transition-colors"
                                                        >
                                                            {q.question}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {q.topic}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {q.difficulty === "Easy" ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                            Easy
                                                        </span>
                                                    ) : q.difficulty === "Medium" ? (
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                            Medium
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                            Hard
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/interview?topic=${encodeURIComponent(q.topic)}`}
                                                            target="_blank"
                                                            className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                                            title="Xem trên web"
                                                        >
                                                            <FiEye size={18} />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/qna/edit/${q.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            title="Sửa"
                                                        >
                                                            <FiEdit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(q.id, q.question)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Xóa"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Topics Sidebar */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                            <FiLayers className="text-purple-500" /> Topics
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(topicsBreakdown)
                                .sort(([, a], [, b]) => b - a)
                                .map(([topic, count]) => (
                                    <div key={topic} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                            {topic}
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                                    </div>
                                ))}
                            {Object.keys(topicsBreakdown).length === 0 && (
                                <span className="text-gray-500 text-sm">No topics</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
