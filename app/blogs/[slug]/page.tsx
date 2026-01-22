"use client";

import { use } from "react";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import LikeBtn from "@/components/Blog/LikeBtn";
import Comments from "@/components/Blog/Comments";
import Toc, { HeadingItem } from "@/components/Blog/Toc";
import Image from "next/image";

// Import highlight.js for syntax highlighting
import "highlight.js/styles/github.css"; // Light mode
import "highlight.js/styles/github-dark.css"; // Dark mode

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

  const hs = Array.from(container.querySelectorAll("h1, h2, h3"));
  const headings: HeadingItem[] = [];

  hs.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    let level = 2;
    if (tag === "h1") level = 1;
    else if (tag === "h3") level = 3;

    const text = (el.textContent || "").trim();
    const id = slugify(text);
    el.setAttribute("id", id);
    headings.push({ id, text, level });
  });

  return { html: container.innerHTML, headings };
}

// Tính thời gian đọc (giả định 200 từ/phút)
function calculateReadingTime(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' '); // Remove HTML tags
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
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
            // Include Firestore ID in the post state
            setPost({ ...data, id: snap.docs[0].id });

            // Inject id cho h2/h3 để TOC
            const { html, headings } = addHeadingIds(data.content || "");
            setContentHtml(html);
            setHeadings(headings);

            // Increment view count
            try {
              const { updateDoc, doc: firestoreDoc, increment } = await import("firebase/firestore");
              await updateDoc(firestoreDoc(db, "posts", snap.docs[0].id), {
                views: increment(1)
              });
            } catch (err) {
              console.error("Error updating view count:", err);
            }

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

  // Apply syntax highlighting to code blocks
  useEffect(() => {
    if (!contentHtml) return;

    // Dynamically import highlight.js
    import('highlight.js').then((hljs) => {
      const article = document.querySelector('article.prose');
      if (!article) return;

      // Find all code blocks
      const codeBlocks = article.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        // Skip if already highlighted
        if (block.classList.contains('hljs')) return;

        // Apply highlighting
        hljs.default.highlightElement(block as HTMLElement);
      });
    });
  }, [contentHtml]);

  // Center image captions
  useEffect(() => {
    if (!contentHtml) return;

    const article = document.querySelector('article.prose');
    if (!article) return;

    // Find all paragraphs and check for figure captions
    const paragraphs = article.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const text = p.textContent?.trim() || '';

      // Check if paragraph contains "Hình X:" pattern
      if (text.match(/^Hình \d+:/)) {
        (p as HTMLElement).style.textAlign = 'center';
        (p as HTMLElement).style.fontSize = '0.875rem';
        (p as HTMLElement).style.color = '#6b7280';
        p.classList.add('image-caption');
      }
    });

    // Find all images in the article
    const images = article.querySelectorAll('img');
    images.forEach((img) => {
      // Get the next sibling element
      let nextElement = img.nextElementSibling;

      // If image is in a paragraph, get the paragraph's next sibling
      if (img.parentElement?.tagName === 'P') {
        nextElement = img.parentElement.nextElementSibling;
      }

      // If next element is a paragraph with text (likely a caption)
      if (nextElement && nextElement.tagName === 'P') {
        const text = nextElement.textContent?.trim();
        // Only treat as caption if it's relatively short (< 200 chars) and doesn't start with common paragraph starters
        if (text && text.length < 200 && !text.match(/^(Như|Theo|Trong|Để|Khi|Vì|Do|Nếu|Tuy|Mặc)/)) {
          nextElement.classList.add('image-caption');
        }
      }
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

  // Tính thời gian đọc
  const readingTime = useMemo(() => {
    return calculateReadingTime(post?.content || "");
  }, [post?.content]);

  // Render Math formulas (KaTeX)
  useEffect(() => {
    if (!contentHtml) return;

    // @ts-ignore
    import("katex/dist/contrib/auto-render").then((renderMathInElement) => {
      const article = document.querySelector("article.prose");
      if (article) {
        renderMathInElement.default(article as HTMLElement, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      }
    });
  }, [contentHtml]);

  if (!post) return <p className="p-6">Đang tải bài viết...</p>;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [post.thumbnail || "https://nhitny-blogs.vercel.app/og-image.png"],
    datePublished: post.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    dateModified: post.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    author: [{
      "@type": "Person",
      name: "Nhitny",
      url: "https://nhitny-blogs.vercel.app"
    }],
    description: post.excerpt || post.title,
    articleBody: post.content?.substring(0, 160) + "..."
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <div className="relative mb-6 h-72 w-full overflow-hidden rounded-lg">
              <Image
                src={post.headerImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Tags ở đầu */}
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats bar: Reading time, Views, Likes, Comments */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span>🕐</span>
              <span>{readingTime} phút đọc</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span>{post.views || 0} lượt xem</span>
            </div>
            <div className="flex items-center gap-1">
              <span>❤️</span>
              <span>{post.likes || 0} thích</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💬</span>
              <span>{post.commentsCount || 0} bình luận</span>
            </div>
          </div>

          {/* Tiêu đề */}
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-gray-100">
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <p
              className="mb-6 text-lg italic border-l-4 border-indigo-600 pl-4 font-semibold text-gray-900 dark:text-gray-100"
            >
              {post.description}
            </p>
          )}

          {/* Author info và dates */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
            {post.student && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{post.student}</span>
                {post.author && (
                  <span className="text-gray-600 dark:text-gray-400">• Tác giả chính</span>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-400">
              {post.date && (
                <span>
                  Xuất bản: {post.date?.toDate?.() ? post.date.toDate().toLocaleDateString('vi-VN') : String(post.date)}
                </span>
              )}
              {post.updatedAt && (
                <>
                  <span>•</span>
                  <span>
                    Cập nhật: {post.updatedAt?.toDate?.() ? post.updatedAt.toDate().toLocaleDateString('vi-VN') : String(post.updatedAt)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Metadata Section (Nhóm, Học viên, Lớp, Ngày) */}
          {(post.group || post.student || post.class || post.assignmentDate) && (
            <div className="mb-8 border-l-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
              <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                {post.title}
              </h2>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {post.group && (
                  <p>
                    <span className="font-bold">Nhóm:</span> {post.group}
                  </p>
                )}
                {post.student && (
                  <p>
                    <span className="font-bold">Học viên:</span> {post.student}
                  </p>
                )}
                {post.class && (
                  <p>
                    <span className="font-bold">Lớp:</span> {post.class}
                  </p>
                )}
                {post.assignmentDate && (
                  <p>
                    <span className="font-bold">Ngày:</span>{" "}
                    {post.assignmentDate?.toDate?.()
                      ? post.assignmentDate.toDate().toLocaleDateString('vi-VN')
                      : post.assignmentDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dấu chấm giống "..." */}
          <div className="mb-6 text-center text-3xl text-gray-400 dark:text-gray-600">• • •</div>

          {/* Nội dung bài viết */}
          <article
            className="prose max-w-none lg:prose-lg dark:prose-invert
              text-black dark:text-white
              prose-p:text-black dark:prose-p:text-white
              prose-headings:text-black dark:prose-headings:text-white
              prose-strong:text-black dark:prose-strong:text-white
              prose-li:text-black dark:prose-li:text-white"
            dangerouslySetInnerHTML={{ __html: contentHtml || post.content }}
          />

          {/* Disclaimer Footer */}
          <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <p className="text-center text-sm italic text-gray-600 dark:text-gray-400">
                &ldquo;Đây là bài viết được tổng hợp từ quá trình tìm hiểu của tác giả, có thể còn nhiều thiếu sót.
                <br />
                Rất mong nhận được sự góp ý từ mọi người để nội dung ngày càng hoàn thiện hơn! ❤️&rdquo;
              </p>
            </div>
          </div>

          {/* Like */}
          <div className="mt-8">
            <LikeBtn postId={post.id} />
          </div>

          {/* Comments */}
          <div className="mt-8">
            <Comments postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
