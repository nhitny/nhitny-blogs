"use client";

import { use } from "react";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import LikeBtn from "@/components/LikeBtn";
import Comments from "@/components/Comments";
import Toc, { HeadingItem } from "@/components/Toc";

// Tạo slug từ text (dùng cho id heading)
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Thêm id cho h2/h3 để TOC hoạt động
function addHeadingIds(html: string): { html: string; headings: HeadingItem[] } {
  if (!html) return { html, headings: [] };

  const container = document.createElement("div");
  container.innerHTML = html;

  const hs = Array.from(container.querySelectorAll("h2, h3"));
  const headings: HeadingItem[] = [];

  hs.forEach((el) => {
    const level = el.tagName.toLowerCase() === "h2" ? 2 : 3;
    const text = (el.textContent || "").trim();
    const id = slugify(text);
    el.setAttribute("id", id);
    headings.push({ id, text, level });
  });

  return { html: container.innerHTML, headings };
}

export default function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState<string>("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // Fetch by slug first, then check publish rules client-side
        // This avoids complex OR rules in Firestore indexes for single document lookup
        const q = query(
          collection(db, "posts"),
          where("slug", "==", slug)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const data = snap.docs[0].data();
          const now = new Date();
          const isPublished = data.isPublished;
          const isScheduledPassed = data.scheduledAt && data.scheduledAt.toDate() <= now;

          if (isPublished || isScheduledPassed) {
            setPost(data);

            // Inject id cho h2/h3 để TOC
            const { html, headings } = addHeadingIds(data.content || "");
            setContentHtml(html);
            setHeadings(headings);
            return;
          }
        }
        setPost(null); // Not found or not published/scheduled yet
      } catch (err) {
        console.error("Error fetching post:", err);
        setPost(null);
      }
    })();
  }, [slug]);

  // Chuẩn hoá tags: chấp nhận array hoặc string (cách nhau bởi , hoặc space)
  const tags: string[] = useMemo(() => {
    if (!post?.tags) return post?.topic ? [post.topic] : [];
    if (Array.isArray(post.tags)) return post.tags;
    return String(post.tags)
      .split(/[,\s]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [post]);

  if (!post) return <p className="p-6">Đang tải bài viết...</p>;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-24">
      {/* Lưới 2 cột: nội dung + TOC */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Nội dung trái */}
        <div className="lg:col-span-8">
          {/* Ảnh header */}
          {post.headerImage && (
            <img
              src={post.headerImage}
              alt={post.title}
              className="mb-6 h-72 w-full rounded-lg object-cover"
            />
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold tracking-wider text-white dark:bg-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Tiêu đề */}
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-gray-100">
            {post.title}
          </h1>

          {/* Tóm tắt / mô tả + ngày */}
          {post.description && (
            <p className="mb-3 text-gray-600 dark:text-gray-400">{post.description}</p>
          )}
          <p className="mb-8 text-sm text-gray-500">
            {post.date?.toDate?.()
              ? post.date.toDate().toLocaleString()
              : post.date}
          </p>

          {/* Dấu chấm giống “...” */}
          <div className="mb-6 text-center text-3xl text-gray-400 dark:text-gray-600">• • •</div>

          {/* Nội dung bài viết */}
          <article
            className="prose max-w-none text-gray-800 dark:prose-invert dark:text-gray-300 lg:prose-lg"
            dangerouslySetInnerHTML={{ __html: contentHtml || post.content }}
          />

          {/* Like */}
          <div className="mt-8">
            <LikeBtn postId={slug} />
          </div>

          {/* Comments */}
          <div className="mt-8">
            <Comments postId={slug} />
          </div>
        </div>

        {/* TOC phải */}
        <aside className="lg:col-span-4">
          <div className="toc sticky top-24 ml-auto max-w-sm">
            <Toc headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
