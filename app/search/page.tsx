"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { fetchPublicPostDocs } from "@/Lib/postQueries";
import Link from "next/link";
import { FiSearch, FiArrowRight, FiX } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";
import { SoftBackground, PageHead } from "@/components/Soft/Soft";

interface Post {
  id: string;
  title: string;
  description: string;
  tags: string[];
  slug: string;
  isPublished?: boolean;
  scheduledAt?: any;
}

// same visibility rule as the post page: published, or scheduled time has passed
function isVisible(p: Post) {
  if (p.isPublished) return true;
  if (!p.scheduledAt) return false;
  const at = p.scheduledAt?.toDate ? p.scheduledAt.toDate() : new Date(p.scheduledAt);
  return at <= new Date();
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams?.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const docs = await fetchPublicPostDocs();
        const posts = docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Post[];
        setAllPosts(posts.filter(isVisible));
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  useEffect(() => setSearchQuery(initialQuery), [initialQuery]);

  const allTags = useMemo(
    () => Array.from(new Set(allPosts.flatMap((p) => p.tags || []))).sort(),
    [allPosts]
  );

  // live, accent-insensitive search over title, description and tags
  const results = useMemo(() => {
    const q = normalize(searchQuery.trim());
    if (!q) return [];
    return allPosts.filter(
      (post) =>
        normalize(post.title || "").includes(q) ||
        normalize(post.description || "").includes(q) ||
        (post.tags || []).some((tag) => normalize(tag).includes(q))
    );
  }, [allPosts, searchQuery]);

  const submit = (q: string) => {
    setSearchQuery(q);
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
  };

  return (
    <main className="st-home st-page min-h-screen">
      <SoftBackground />
      <PageHead label="~/search" title="Tìm" accent="kiếm." subtitle="Gõ từ khoá — tiêu đề, mô tả hoặc tag đều được, không cần dấu." />

      <div className="st-wrap pb-24">
        <form
          className="relative max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            submit(searchQuery.trim());
          }}
        >
          <FiSearch className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-st-muted" />
          <input
            type="text"
            inputMode="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="vd: RAG, reranker, ensemble…"
            className="st-input !pl-12 !pr-12"
            autoFocus
            aria-label="Từ khoá tìm kiếm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => submit("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-st-muted hover:text-st-ink"
              aria-label="Xoá từ khoá"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </form>

        {allTags.length > 0 && (
          <div className="mt-5 flex max-w-3xl flex-wrap gap-2">
            {allTags.map((tag) => (
              <button key={tag} onClick={() => submit(tag)} className="st-hash">
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-12 max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="st-card h-28 animate-pulse" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="mb-5 font-mono text-xs text-st-muted">
                {results.length} kết quả cho &ldquo;{searchQuery}&rdquo;
              </p>
              <div className="grid gap-4">
                {results.map((post) => (
                  <Link key={post.id} href={`/blogs/${post.slug}`} className="st-card group block p-6 transition hover:-translate-y-1 hover:shadow-st-hover">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags?.map((tag) => (
                        <span key={tag} className="st-hash">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-serif text-xl font-medium text-st-ink">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-st-muted">{post.description}</p>
                    <span className="st-link mt-3">
                      Đọc bài <FiArrowRight />
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : searchQuery ? (
            <div className="st-card p-10 text-center">
              <p className="font-serif text-2xl italic text-st-ink">Chưa thấy bài nào khớp…</p>
              <p className="mt-2 text-st-muted">Thử một tag ở trên, hoặc từ khoá ngắn hơn nhé.</p>
            </div>
          ) : (
            <p className="font-serif text-lg italic text-st-muted">Nhập từ khoá hoặc chọn một tag để bắt đầu khám phá.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SearchContent />
    </Suspense>
  );
}
