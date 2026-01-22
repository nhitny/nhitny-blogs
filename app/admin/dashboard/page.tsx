"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { FiBookOpen, FiHelpCircle, FiLogOut } from "react-icons/fi";

export default function AdminDashboardLanding() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (!currentUser) {
                    router.replace("/admin/login");
                    return;
                }

                const uref = doc(db, "users", currentUser.uid);
                const snap = await getDoc(uref);
                const role = snap.exists() ? (snap.data() as any).role : null;

                if (role !== "admin") {
                    await signOut(auth);
                    router.replace("/admin/login");
                    return;
                }

                setUser(currentUser);
            } finally {
                setCheckingAuth(false);
            }
        });
        return () => unsub();
    }, [router]);

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-400">Đang kiểm tra quyền...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <div className="mx-auto max-w-6xl px-6 py-12">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Chào mừng trở lại, {user?.displayName || user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
                    >
                        <FiLogOut /> Đăng xuất
                    </button>
                </div>

                {/* Dashboard Cards */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Blog Dashboard Card */}
                    <Link
                        href="/admin/dashboard/blog"
                        className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl dark:bg-gray-800"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-100 opacity-50 transition-transform group-hover:scale-150 dark:bg-indigo-900/30"></div>

                        <div className="relative">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                <FiBookOpen size={32} />
                            </div>

                            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Blog Dashboard
                            </h2>

                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                Quản lý bài viết blog, xem thống kê, chỉnh sửa và xuất bản nội dung mới.
                            </p>

                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                                Mở Dashboard
                                <span className="transition-transform group-hover:translate-x-2">→</span>
                            </div>
                        </div>
                    </Link>

                    {/* Interview Q&A Dashboard Card */}
                    <Link
                        href="/admin/dashboard/qna"
                        className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl dark:bg-gray-800"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-100 opacity-50 transition-transform group-hover:scale-150 dark:bg-emerald-900/30"></div>

                        <div className="relative">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                                <FiHelpCircle size={32} />
                            </div>

                            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Interview Q&A
                            </h2>

                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                Quản lý câu hỏi phỏng vấn, thêm câu hỏi mới và xem thống kê.
                            </p>

                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                Mở Dashboard
                                <span className="transition-transform group-hover:translate-x-2">→</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="mt-12">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/admin/new"
                            className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            + Viết bài mới
                        </Link>
                        <Link
                            href="/admin/qna/new"
                            className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700 transition-colors shadow-md"
                        >
                            + Thêm câu hỏi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
