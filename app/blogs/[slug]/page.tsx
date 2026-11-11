"use client";

import { use } from "react";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import LikeBtn from "@/components/Blog/LikeBtn";
import Comments from "@/components/Blog/Comments";
import Toc, { HeadingItem } from "@/components/Blog/Toc";
import Image from "next/image";
import Script from "next/script";
import katex from "katex";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiEye, FiHeart, FiMessageCircle } from "react-icons/fi";
import { SoftBackground } from "@/components/Soft/Soft";
import ReadingProgress from "@/components/Blog/ReadingProgress";

// Import highlight.js for syntax highlighting
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
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

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
            setStatus("ready");

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
        setStatus("missing");
      } catch (err) {
        console.error("Error fetching post:", err);
        setPost(null);
        setStatus("missing");
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
  // Render Math formulas (KaTeX)
  useEffect(() => {
    if (!contentHtml) return;

    const renderMath = async () => {
      try {
        // @ts-ignore
        const renderMathInElement = (await import("katex/dist/contrib/auto-render")).default;
        const article = document.querySelector("article.prose");

        if (article) {
          // 1. Auto-render delimiters
          renderMathInElement(article as HTMLElement, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true },
            ],
            throwOnError: false,
            output: "html",
          });

          // 2. Fallback for Explicit Tiptap Math Nodes
          const mathNodes = article.querySelectorAll(".math-inline, .math-display");
          mathNodes.forEach((node) => {
            if (node.querySelector(".katex")) return; // Skip if already rendered

            let tex = node.textContent || "";
            // Remove outer $ if present
            tex = tex.replace(/^\$+|\$+$/g, "");

            const isDisplay = node.classList.contains("math-display") || node.tagName === "DIV";

            try {
              katex.render(tex, node as HTMLElement, {
                throwOnError: false,
                displayMode: isDisplay,
                output: "html",
              });
            } catch (err) {
              console.error("KaTeX Fallback Error:", err);
            }
          });
        }
      } catch (e) {
        console.error("KaTeX Loading Error:", e);
      }
    };

    // Run twice to ensure hydration
    // Instant
    renderMath();

    // Delayed (covers slower DOM updates)
    const t = setTimeout(renderMath, 500);

    return () => clearTimeout(t);
  }, [contentHtml]);

  if (!post) {
    return (
      <main className="st-home st-page min-h-[70vh]">
        <SoftBackground />
        <div className="st-wrap pt-32 pb-24">
          {status === "missing" ? (
            <div className="st-card mx-auto max-w-xl p-10 text-center">
              <p className="font-mono text-xs text-st-muted">404 · không tìm thấy</p>
              <h1 className="st-h2 mt-2">
                Bài viết này <em>chưa có</em>
              </h1>
              <p className="st-body">Có thể bài đã bị gỡ hoặc chưa được xuất bản.</p>
              <Link href="/blogs" className="st-btn primary mt-4">
                <FiArrowLeft /> Về danh sách bài viết
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl animate-pulse space-y-4">
              <div className="h-4 w-40 rounded-full bg-st-line" />
              <div className="h-12 w-full rounded-2xl bg-st-line" />
              <div className="h-12 w-2/3 rounded-2xl bg-st-line" />
              <div className="h-4 w-1/2 rounded-full bg-st-line" />
              <div className="mt-8 h-64 w-full rounded-3xl bg-st-line" />
            </div>
          )}
        </div>
      </main>
    );
  }

  // JSON-LD Structured Data
  const fmtDate = (d: any) => (d?.toDate?.() ? d.toDate().toLocaleDateString("vi-VN") : d ? String(d) : "");

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
    <main className="st-home st-page">
      <ReadingProgress />
      <SoftBackground />
      {/* KaTeX CDN */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <Script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" strategy="lazyOnload" />
      <Script
        src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          // @ts-ignore
          if (window.renderMathInElement) {
            // @ts-ignore
            window.renderMathInElement(document.body, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true }
              ],
              throwOnError: false
            });
          }
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="st-wrap pt-24 pb-24 md:pt-28">
        <Link href="/blogs" className="st-link mb-8">
          <FiArrowLeft /> Tất cả bài viết
        </Link>

        {/* ---------- header ---------- */}
        <header className="mx-auto max-w-4xl lg:mx-0">
          {tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="st-hash">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <h1 className="st-article-title">{post.title}</h1>

          {post.description && <p className="st-article-lead mt-6">{post.description}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-xs text-st-muted">
            <span className="flex items-center gap-2.5">
              <span className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-lavender-200 to-rose-200 dark:from-lavender-900 dark:to-rose-900">
                <Image src="/chibi.webp" alt="" fill sizes="36px" className="object-cover object-top" />
              </span>
              <span className="font-sans text-sm font-semibold text-st-ink">{post.student || "Nhitny"}</span>
            </span>
            {post.date && <span>xuất bản {fmtDate(post.date)}</span>}
            {post.updatedAt && <span>cập nhật {fmtDate(post.updatedAt)}</span>}
            <span className="flex items-center gap-1.5"><FiClock /> {readingTime} phút đọc</span>
            <span className="flex items-center gap-1.5"><FiEye /> {post.views || 0}</span>
            <span className="flex items-center gap-1.5"><FiHeart /> {post.likes || 0}</span>
            <span className="flex items-center gap-1.5"><FiMessageCircle /> {post.commentsCount || 0}</span>
          </div>
        </header>

        {post.headerImage && (
          <div className="relative mt-10 h-64 w-full overflow-hidden rounded-[28px] border border-st-line shadow-st md:h-96">
            <Image src={post.headerImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* assignment metadata (group / student / class / date) */}
        {(post.group || post.student || post.class || post.assignmentDate) && (
          <div className="st-card mt-10 grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["nhóm", post.group],
              ["học viên", post.student],
              ["lớp", post.class],
              ["ngày", fmtDate(post.assignmentDate)],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string}>
                  <p className="font-mono text-[0.68rem] uppercase tracking-widest text-st-muted">{k}</p>
                  <p className="mt-1 font-serif text-lg text-st-ink">{v as string}</p>
                </div>
              ))}
          </div>
        )}

        {/* ---------- body: TOC + article ---------- */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <Toc headings={headings} />
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            <article
              className="st-article prose max-w-3xl lg:prose-lg dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: contentHtml || post.content }}
            />

            <div className="st-note mt-14 max-w-3xl">
              &ldquo;Bài viết được tổng hợp từ quá trình tự tìm hiểu nên có thể còn thiếu sót — rất mong nhận được
              góp ý để nội dung ngày càng hoàn thiện hơn.&rdquo; ♡
            </div>

            <div className="mt-8 max-w-3xl">
              <LikeBtn postId={post.id} />
            </div>

            <div className="mt-8 max-w-3xl">
              <Comments postId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
