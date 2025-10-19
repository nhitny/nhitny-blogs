import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BlogHeader from "@/components/BlogHeader";
import { getAllBlogPosts, getAllTopics } from "@/Lib/Data";

export const metadata: Metadata = {
  title: "Explore • Learn • Build — Blogs",
  description: "Latest posts on JS, React and Web.",
};

export default async function BlogsPage() {
  const blogs = await getAllBlogPosts();      // đã lọc isPublished == true
  const topics = await getAllTopics();

  return (
    <>
      <Navbar topics={topics} />

      {/* HERO */}
      <section className="relative bg-gray-950 text-gray-100">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-28 sm:pb-12">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/60 px-3 py-1">
                <span>🖼️</span>
                <span className="text-gray-300">Latest</span>
              </button>
              <button className="rounded-full border border-gray-800 bg-gray-900/60 px-3 py-1 text-gray-300">
                Posts ▾
              </button>
            </div>
            {/* chỗ icon theme/login nếu muốn */}
          </div>

          {/* Title center, gradient đúng tone */}
          <h1 className="mt-8 text-center text-5xl font-extrabold tracking-tight sm:text-7xl">
            <span className="text-gray-300">Explore </span>
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Learn
            </span>
            <span className="text-gray-300"> Build</span> <span>🚀</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-center text-[15px] text-gray-400">
            Difference giữa SSR và CSR, core React concepts, Javascript fundamentals…
          </p>
        </div>
      </section>

      {/* GRID */}
      <main className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b: any) => b.isPublished && <BlogHeader key={b.id} data={b} />)}
        </div>
      </main>
    </>
  );
}
