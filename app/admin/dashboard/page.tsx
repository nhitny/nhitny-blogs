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
} from "firebase/firestore";
import ThemeToggle from "@/components/ThemeToggle";

type Post = {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  date?: any; // Firestore Timestamp | ISO | string
  isPublished?: boolean;
  scheduledAt?: any; // Firestore Timestamp | ISO | string
};

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🧱 Kiểm tra đăng nhập & quyền admin
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

        await fetchPosts();
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  // 🔄 Lấy danh sách bài viết
  const fetchPosts = async () => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => {
      const v = d.data() as any;
      const dateStr = v?.date?.toDate
        ? v.date.toDate().toISOString()
        : v?.date ?? null;
      const scheduledStr = v?.scheduledAt?.toDate
        ? v.scheduledAt.toDate().toISOString()
        : v?.scheduledAt ?? null;
      return { id: d.id, ...v, date: dateStr, scheduledAt: scheduledStr } as Post;
    });
    setPosts(data);
    setLoading(false);
  };

  // ❌ Xóa bài viết
  const handleDelete = async (id: string, title?: string) => {
    const confirmDelete = confirm(`Bạn có chắc muốn xóa bài "${title}"?`);
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      alert("🗑️ Đã xóa bài viết!");
      await fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa bài viết!");
    }
  };

  if (!mounted) return null; // or a stable skeleton that matches server output exactly

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="p-10 text-center text-gray-400">Đang kiểm tra quyền…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/blogs" className="text-indigo-400 hover:underline">
          ← Quay lại Blog
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/admin/new"
            className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500"
          >
            + Viết bài mới
          </Link>
          <button
            onClick={() => fetchPosts()}
            className="text-sm text-gray-500 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        📘 Admin — Quản lý bài viết
      </h1>

      {loading ? (
        <div className="p-6 text-center text-gray-400">Đang tải dữ liệu…</div>
      ) : posts.length === 0 ? (
        <p className="text-gray-300">Chưa có bài viết nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Tiêu đề
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Ngày
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {p.title ?? "(không tiêu đề)"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {p.slug ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {p.date
                      ? new Date(p.date).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {p.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-green-600/20 px-2 py-0.5 text-green-400">
                        Published
                      </span>
                    ) : (p.scheduledAt && new Date(p.scheduledAt) <= new Date()) ? (
                      <span className="inline-flex items-center rounded-full bg-green-600/20 px-2 py-0.5 text-green-400">
                        Published (Auto)
                      </span>
                    ) : (p.scheduledAt && new Date(p.scheduledAt) > new Date()) ? (
                      <span className="inline-flex items-center rounded-full bg-blue-600/20 px-2 py-0.5 text-blue-400">
                        Scheduled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-600/20 px-2 py-0.5 text-yellow-400">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    {p.slug ? (
                      <Link
                        href={`/blogs/${p.slug}`}
                        target="_blank"
                        className="text-indigo-400 hover:underline"
                      >
                        Xem
                      </Link>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                    <Link
                      href={`/admin/edit/${p.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="text-red-400 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        * Chức năng “Sửa” sẽ mở trang /admin/edit/[id] (bạn có thể tạo sau).
      </p>
    </div>
  );
}
