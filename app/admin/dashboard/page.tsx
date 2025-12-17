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
  collectionGroup,
  limit,
} from "firebase/firestore";
import ConfirmModal from "@/components/ConfirmModal";
import { FiHeart, FiEye, FiMessageSquare, FiTrendingUp, FiLayers, FiActivity, FiCalendar } from "react-icons/fi";

type Post = {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  date?: any; // Firestore Timestamp | ISO | string
  isPublished?: boolean;
  scheduledAt?: any; // Firestore Timestamp | ISO | string
  views?: number;
  likes?: number;
  commentsCount?: number;
  tags?: string[];
};

type Comment = {
  id: string;
  content: string;
  createdAt: any;
  userDisplayName?: string;
  userPhoto?: string;
  userId?: string;
  postId?: string; // Implicitly from parent, but helpful if we can get it
};

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    topicsCount: 0,
    topLiked: null as Post | null,
    topViewed: null as Post | null,
    topDiscussed: null as Post | null,
  });

  // Topics breakdown
  const [topicsBreakdown, setTopicsBreakdown] = useState<Record<string, number>>({});

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

        await Promise.all([fetchPosts(), fetchRecentComments()]);
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    calculateStats(data);
    setLoading(false);
  };

  const fetchRecentComments = async () => {
    try {
      // Note: This requires a composite index in Firestore (Collection Group: comments, Field: createdAt DESC)
      // If it fails, check console for the index creation link.
      const q = query(collectionGroup(db, "comments"), orderBy("createdAt", "desc"), limit(5));
      const snap = await getDocs(q);
      const comments = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // Extract postId from ref path if needed: d.ref.parent.parent?.id
        postId: d.ref.parent.parent?.id
      })) as Comment[];
      setRecentComments(comments);
    } catch (e) {
      console.warn("Error fetching recent comments (likely missing index):", e);
    }
  };

  const calculateStats = (posts: Post[]) => {
    let views = 0;
    let likes = 0;
    let comments = 0;
    const topics: Record<string, number> = {};

    posts.forEach(p => {
      views += p.views || 0;
      likes += p.likes || 0;
      comments += p.commentsCount || 0;

      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          topics[t] = (topics[t] || 0) + 1;
        });
      }
    });

    const sortedByLikes = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const sortedByViews = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
    const sortedByComments = [...posts].sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));

    setStats({
      totalPosts: posts.length,
      totalViews: views,
      totalLikes: likes,
      totalComments: comments,
      topicsCount: Object.keys(topics).length,
      topLiked: sortedByLikes[0] || null,
      topViewed: sortedByViews[0] || null,
      topDiscussed: sortedByComments[0] || null,
    });
    setTopicsBreakdown(topics);
  };

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: "",
    postTitle: "",
  });

  // ❌ Xóa bài viết
  const handleDeleteClick = (id: string, title?: string) => {
    setDeleteModal({ isOpen: true, postId: id, postTitle: title || "Bài viết này" });
  };

  const onConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "posts", deleteModal.postId));
      setDeleteModal((prev) => ({ ...prev, isOpen: false }));
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
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${deleteModal.postTitle}"? Hành động này không thể hoàn tác.`}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          📘 Quản lý bài viết
        </h1>
        <Link
          href="/admin/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
        >
          + Viết bài mới
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 text-indigo-500 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/20"><FiLayers size={20} /></div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 text-pink-500 mb-2">
            <div className="p-2 bg-pink-50 rounded-lg dark:bg-pink-900/20"><FiHeart size={20} /></div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Likes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20"><FiEye size={20} /></div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg dark:bg-emerald-900/20"><FiMessageSquare size={20} /></div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Comments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComments}</p>
        </div>
      </div>

      {/* Top Content */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-yellow-500" /> Top Content
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.topLiked && (
            <div className="rounded-lg bg-gradient-to-br from-pink-50 to-white p-4 border border-pink-100 dark:from-pink-900/10 dark:to-gray-800 dark:border-pink-900/20">
              <p className="text-xs font-semibold text-pink-600 uppercase mb-1">Most Liked</p>
              <div className="font-bold text-gray-900 dark:text-white truncate" title={stats.topLiked.title}>
                {stats.topLiked.title}
              </div>
              <div className="mt-2 flex items-center gap-1 text-pink-500 font-medium">
                <FiHeart /> {stats.topLiked.likes}
              </div>
            </div>
          )}
          {stats.topViewed && (
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white p-4 border border-blue-100 dark:from-blue-900/10 dark:to-gray-800 dark:border-blue-900/20">
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Most Viewed</p>
              <div className="font-bold text-gray-900 dark:text-white truncate" title={stats.topViewed.title}>
                {stats.topViewed.title}
              </div>
              <div className="mt-2 flex items-center gap-1 text-blue-500 font-medium">
                <FiEye /> {stats.topViewed.views}
              </div>
            </div>
          )}
          {stats.topDiscussed && (
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-white p-4 border border-emerald-100 dark:from-emerald-900/10 dark:to-gray-800 dark:border-emerald-900/20">
              <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Most Discussed</p>
              <div className="font-bold text-gray-900 dark:text-white truncate" title={stats.topDiscussed.title}>
                {stats.topDiscussed.title}
              </div>
              <div className="mt-2 flex items-center gap-1 text-emerald-500 font-medium">
                <FiMessageSquare /> {stats.topDiscussed.commentsCount}
              </div>
            </div>
          )}
          {!stats.topLiked && <div className="text-sm text-gray-500">Chưa có dữ liệu thống kê.</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Posts Table - Takes 3 columns */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Posts</h3>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{posts.length} entries</span>
            </div>
            {loading ? (
              <div className="p-10 text-center text-gray-400">Loading data...</div>
            ) : posts.length === 0 ? (
              <div className="p-6 text-center text-gray-400">Không có bài viết nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Post</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Metrics</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Scheduled</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                    {posts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 group transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={p.title}>{p.title || "(No title)"}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {p.date ? new Date(p.date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1" title="Views"><FiEye /> {p.views || 0}</span>
                            <span className="flex items-center gap-1" title="Likes"><FiHeart /> {p.likes || 0}</span>
                            <span className="flex items-center gap-1" title="Comments"><FiMessageSquare /> {p.commentsCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.isPublished ? (
                            <span title="Bài viết đã được xuất bản công khai" className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-help">Published</span>
                          ) : (p.scheduledAt && new Date(p.scheduledAt) > new Date()) ? (
                            <span title="Bài viết sẽ tự động xuất bản vào thời gian đã hẹn" className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-help">Scheduled</span>
                          ) : (
                            <span title="Bản nháp - chưa công khai" className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 cursor-help">Draft</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {p.scheduledAt && new Date(p.scheduledAt) > new Date() ? (
                            <span>{new Date(p.scheduledAt).toLocaleString('vi-VN')}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/edit/${p.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">Edit</Link>
                            <button onClick={() => handleDeleteClick(p.id, p.title)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium">Delete</button>
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

        {/* Right Sidebar: Topics only */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
              <FiLayers className="text-purple-500" /> Topics
            </h3>
            <div className="space-y-3">
              {Object.entries(topicsBreakdown).sort(([, a], [, b]) => b - a).map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{topic}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
              {Object.keys(topicsBreakdown).length === 0 && <span className="text-gray-500 text-sm">No topics</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
