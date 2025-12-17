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
import ThemeToggle from "@/components/ThemeToggle";

const RichText = dynamic(() => import("@/components/RichText"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-400">Đang tải editor…</div>,
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
  const [editorQuill, setEditorQuill] = useState<any>(null);

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
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);

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

  // Upload ảnh -> URL
  const uploadImage = async (file: File) => {
    const r = ref(storage, `images/${Date.now()}-${file.name}`);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };

  // Chèn ảnh vào editor
  const insertImage = async (file?: File) => {
    if (!file || !editorQuill) return;
    const url = await uploadImage(file);
    const range = editorQuill.getSelection(true);
    editorQuill.insertEmbed(range ? range.index : 0, "image", url, "user");
    editorQuill.setSelection((range ? range.index : 0) + 1);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("Vui lòng nhập Tiêu đề và Nội dung!");
      return;
    }
    const payload: any = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description ?? "",
      headerImage: form.headerImage ?? "",
      tags: form.tags ?? [],
      author: form.author ?? "",
      content: form.content,
      isPublished: form.isPublished,
      date: serverTimestamp(),
      views: 0,
      likes: 0,
      commentsCount: 0,
    };

    if (form.scheduledAt) {
      payload.scheduledAt = Timestamp.fromDate(new Date(form.scheduledAt));
      // tuỳ logic của bạn: có thể bỏ isPublished=false để chỉ rely vào scheduledAt + Firestore Rules
    }

    await addDoc(collection(db, "posts"), payload);
    alert("✅ Đã tạo bài viết!");
    router.replace("/admin/dashboard");
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {checkingAuth ? (
        <div className="p-10 text-center text-gray-400">Đang kiểm tra quyền…</div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <Link href="/admin/dashboard" className="text-indigo-400 hover:underline">
              ← Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/blogs" className="text-indigo-400 hover:underline">
                ← Back to Blog
              </Link>
            </div>
          </div>

          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">📝 Soạn bài viết mới</h1>

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

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600"
                onClick={() => inlineImageInputRef.current?.click()}
              >
                Chèn ảnh vào nội dung…
              </button>
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => insertImage(e.target.files?.[0])}
              />
            </div>

            <RichText
              value={form.content}
              onChange={(html) => setForm(s => ({ ...s, content: html }))}
              placeholder="Viết nội dung (Heading 2/3 giúp TOC hiển thị đẹp)…"
              onReady={(q) => setEditorQuill(q)}
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

            <button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">Tạo bài</button>
          </form>
        </>
      )}
    </div>
  );
}
