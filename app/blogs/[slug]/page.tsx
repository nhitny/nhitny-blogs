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

  // Render KaTeX formulas after content is loaded
  useEffect(() => {
    if (!contentHtml) return;

    // Dynamically import and render KaTeX
    import('katex').then((katex) => {
      const article = document.querySelector('article.prose');
      if (!article) return;

      // Method 1: Find code blocks with LaTeX
      const codeBlocks = article.querySelectorAll('pre');
      codeBlocks.forEach((pre) => {
        const code = pre.querySelector('code');
        if (!code) return;

        const text = code.textContent || '';

        // Check if it's a LaTeX formula
        if (text.trim().startsWith('$$') && text.trim().endsWith('$$')) {
          const latex = text.trim().slice(2, -2).trim();
          const container = document.createElement('div');
          container.className = 'katex-display my-4';

          try {
            katex.default.render(latex, container, {
              throwOnError: false,
              displayMode: true,
            });
            pre.replaceWith(container);
          } catch (e) {
            console.error('KaTeX render error:', e);
          }
        } else if (text.trim().startsWith('$') && text.trim().endsWith('$') && !text.trim().startsWith('$$')) {
          const latex = text.trim().slice(1, -1).trim();
          const container = document.createElement('span');
          container.className = 'katex-inline';

          try {
            katex.default.render(latex, container, {
              throwOnError: false,
              displayMode: false,
            });
            pre.replaceWith(container);
          } catch (e) {
            console.error('KaTeX render error:', e);
          }
        }
      });

      // Method 2: Find LaTeX in text nodes (for direct typing)
      const walker = document.createTreeWalker(
        article,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';

        // Match display math: $$...$$
        const displayRegex = /\$\$([^$]+)\$\$/g;
        // Match inline math: $...$
        const inlineRegex = /\$([^$]+)\$/g;

        if (displayRegex.test(text) || inlineRegex.test(text)) {
          const span = document.createElement('span');
          let html = text;

          // Replace display math
          html = html.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
            const container = document.createElement('div');
            container.className = 'katex-display my-4';
            try {
              katex.default.render(latex.trim(), container, {
                throwOnError: false,
                displayMode: true,
              });
              return container.outerHTML;
            } catch (e) {
              console.error('KaTeX error:', e);
              return match;
            }
          });

          // Replace inline math
          html = html.replace(/\$([^$]+)\$/g, (match, latex) => {
            const container = document.createElement('span');
            container.className = 'katex-inline';
            try {
              katex.default.render(latex.trim(), container, {
                throwOnError: false,
                displayMode: false,
              });
              return container.outerHTML;
            } catch (e) {
              console.error('KaTeX error:', e);
              return match;
            }
          });

          span.innerHTML = html;
          textNode.replaceWith(span);
        }
      });
    });
  }, [contentHtml]);

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
      {/* Lưới 2 cột: TOC trái + nội dung phải */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* TOC trái */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <Toc headings={headings} />
          </div>
        </aside>

        {/* Nội dung phải */}
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

          {/* Dấu chấm giống "..." */}
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
      </div>
    </div>
  );
}
