"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { auth, db, storage } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


const TiptapEditor = dynamic(() => import("@/components/Blog/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-400">Đang tải editor…</div>,
});

const PreviewModal = dynamic(() => import("@/components/UI/PreviewModal"), {
  ssr: false,
});

type PostForm = {
  title: string;
  slug: string;
  description?: string;
  headerImage?: string;
  tags: string[];
  author?: string;
  content: string;
  isPublished: boolean;
  scheduledAt: string; // datetime-local string (optional)
};

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export default function NewPostPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [postId, setPostId] = useState<string | null>(null); // Track draft ID
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState<PostForm>({
    title: "",
    slug: "",
    description: "",
    headerImage: "",
    tags: [],
    author: "",
    content: "",
    isPublished: false,
    scheduledAt: "",
  });

  const headerInputRef = useRef<HTMLInputElement | null>(null);


  // Guard admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/admin/login");
          return;
        }
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? (snap.data() as any).role : null;
        if (role !== "admin") {
          await signOut(auth);
          router.replace("/admin/login");
          return;
        }
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  // Auto-create draft on mount
  useEffect(() => {
    if (checkingAuth || postId) return;

    const createDraft = async () => {
      try {
        const docRef = await addDoc(collection(db, "posts"), {
          title: "Untitled Draft",
          slug: `draft-${Date.now()}`,
          content: "",
          isPublished: false,
          date: serverTimestamp(),
          views: 0,
          likes: 0,
          commentsCount: 0,
        });
        setPostId(docRef.id);
        console.log("✅ Auto-created draft:", docRef.id);
      } catch (err) {
        console.error("Failed to create draft:", err);
      }
    };

    createDraft();
  }, [checkingAuth, postId]);

  // Auto-save with debounce
  useEffect(() => {
    if (!postId || checkingAuth) return;

    const timer = setTimeout(async () => {
      try {
        setSaving(true);
        const { updateDoc } = await import("firebase/firestore");
        const payload: any = {
          title: form.title || "Untitled Draft",
          slug: form.slug || slugify(form.title || `draft-${Date.now()}`),
          description: form.description ?? "",
          headerImage: form.headerImage ?? "",
          tags: form.tags ?? [],
          author: form.author ?? "",
          content: form.content,
          isPublished: form.isPublished,
        };

        if (form.scheduledAt) {
          payload.scheduledAt = Timestamp.fromDate(new Date(form.scheduledAt));
        }



        payload.updatedAt = serverTimestamp();

        await updateDoc(doc(db, "posts", postId), payload);
        setLastSaved(new Date());
        console.log("💾 Auto-saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 2000); // Debounce 2 seconds

    return () => clearTimeout(timer);
  }, [form, postId, checkingAuth]);

  // Upload ảnh -> URL
  const uploadImage = async (file: File) => {
    const r = ref(storage, `images/${Date.now()}-${file.name}`);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("Vui lòng nhập Tiêu đề và Nội dung!");
      return;
    }

    if (!postId) {
      alert("Lỗi: Không tìm thấy bài viết!");
      return;
    }

    // Validation & Confirmation
    let finalIsPublished = form.isPublished;

    if (form.scheduledAt) {
      const scheduleTime = new Date(form.scheduledAt);
      if (scheduleTime <= new Date()) {
        alert("⚠️ Thời gian hẹn phải lớn hơn thời gian hiện tại!");
        return;
      }
      const confirmSchedule = window.confirm(`Bạn có muốn LÊN LỊCH xuất bản bài viết vào lúc ${scheduleTime.toLocaleString('vi-VN')} không?`);
      if (!confirmSchedule) return;

      // Nếu lên lịch thì force isPublished = false (để nó ko hiện là Published ngay)
      finalIsPublished = false;
    } else if (form.isPublished) {
      const confirmPublish = window.confirm("Bạn có muốn XUẤT BẢN bài viết này công khai ngay bây giờ?");
      if (!confirmPublish) return;
    } else {
      // Draft
      const confirmDraft = window.confirm("Lưu bài viết dưới dạng BẢN NHÁP (Draft)?");
      if (!confirmDraft) return;
    }

    try {
      const { updateDoc } = await import("firebase/firestore");
      const payload: any = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description ?? "",
        headerImage: form.headerImage ?? "",
        tags: form.tags ?? [],
        author: form.author ?? "",
        content: form.content,
        isPublished: finalIsPublished,
      };

      if (form.scheduledAt) {
        payload.scheduledAt = Timestamp.fromDate(new Date(form.scheduledAt));
      } else {
        payload.scheduledAt = null; // Clear schedule if removed
      }

      payload.updatedAt = serverTimestamp();

      await updateDoc(doc(db, "posts", postId), payload);
      alert(finalIsPublished ? "✅ Đã xuất bản!" : (form.scheduledAt ? "✅ Đã lên lịch!" : "✅ Đã lưu bản nháp!"));
      router.replace("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu bài viết!");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {checkingAuth ? (
        <div className="p-10 text-center text-gray-400">Đang kiểm tra quyền…</div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📝 Soạn bài viết mới</h1>
              {saving && <p className="text-sm text-gray-500 mt-1">💾 Đang lưu...</p>}
              {!saving && lastSaved && <p className="text-sm text-green-600 mt-1">✅ Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}</p>}
            </div>
            <Link href="/admin/dashboard" className="flex items-center text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
              ← Quay lại Dashboard
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
            <input
              className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Tiêu đề"
              value={form.title}
              onChange={(e) => setForm(s => ({ ...s, title: e.target.value, slug: slugify(e.target.value) }))}
              required
            />

            <input
              className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm(s => ({ ...s, slug: slugify(e.target.value) }))}
            />

            <input
              className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Mô tả ngắn"
              value={form.description}
              onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
            />

            <div className="flex gap-2">
              <input
                className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Header Image URL"
                value={form.headerImage}
                onChange={(e) => setForm(s => ({ ...s, headerImage: e.target.value }))}
              />
              <button
                type="button"
                className="rounded bg-gray-200 px-3 text-sm text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600"
                onClick={() => headerInputRef.current?.click()}
              >
                Upload…
              </button>
              <input
                ref={headerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadImage(f);
                  setForm(s => ({ ...s, headerImage: url }));
                }}
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    🏷️ {tag}
                    <button
                      type="button"
                      onClick={() => setForm(s => ({ ...s, tags: s.tags.filter((_, i) => i !== idx) }))}
                      className="ml-1 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Nhập tag và nhấn Enter để thêm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const newTag = input.value.trim();
                    if (newTag && !form.tags.includes(newTag)) {
                      setForm(s => ({ ...s, tags: [...s.tags, newTag] }));
                      input.value = '';
                    }
                  }
                }}
              />
            </div>

            <input
              className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Tên tác giả"
              value={form.author}
              onChange={(e) => setForm(s => ({ ...s, author: e.target.value }))}
            />



            <TiptapEditor
              value={form.content}
              onChange={(html: string) => setForm(s => ({ ...s, content: html }))}
              placeholder="Nhấn '/' để xem lệnh, hoặc bắt đầu viết... (Heading 2/3 giúp TOC hiển thị đẹp)"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm(s => ({ ...s, isPublished: e.target.checked }))}
                />
                Publish ngay?
              </label>

              <div className="sm:col-span-2">
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Hoặc lên lịch đăng</label>
                <input
                  type="datetime-local"
                  className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  value={form.scheduledAt}
                  onChange={(e) => setForm(s => ({ ...s, scheduledAt: e.target.value }))}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Nếu chọn thời gian, bài sẽ tự public khi đến giờ (nhờ Firestore Rules).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                👁️ Xem trước
              </button>
              <button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition-colors">
                Tạo bài
              </button>
            </div>
          </form>

          {/* Preview Modal */}
          <PreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            post={form}
          />
        </>
      )}
    </div>
  );
}
