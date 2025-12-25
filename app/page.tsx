import { getAllBlogPosts, getAllTopics } from "@/Lib/Data";
import BlogHeader from "@/components/Blog/BlogHeader";
import Hero from "@/components/Layout/Hero";
import Link from "next/link";
import { FiArrowRight, FiTag, FiClock } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import TopicMarquee from "@/components/Layout/TopicMarquee";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getAllBlogPosts();
  const topics = await getAllTopics();

  // Latest 3 posts
  const latestPosts = posts.slice(0, 3);

  // Featured posts: Sort by views (descending) and take top 3
  const featuredPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />

      {/* Featured Posts Section - New */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
            <FaFire className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Bài viết nổi bật
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.length > 0 ? (
            featuredPosts.map((post: any) => (
              <BlogHeader key={`featured - ${post.id} `} data={post} />
            ))
          ) : (
            <p className="text-gray-500">Chưa có bài viết nổi bật nào.</p>
          )}
        </div>
      </section>

      {/* Topics Cloud - Dynamic Marquee */}
      <section className="relative w-full overflow-hidden bg-gray-50 py-16 dark:bg-[#0c111d]">
        <div className="mx-auto mb-8 max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <FiTag className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Chủ đề khám phá
            </h2>
          </div>
        </div>

        <TopicMarquee topics={topics} />
      </section>

      {/* Latest Posts Section */}
      <section className="relative mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <FiClock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Mới cập nhật
            </h2>
          </div>

          <Link
            href="/blogs"
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Xem tất cả <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((b: any) => (
            <BlogHeader key={b.id} data={b} />
          ))}
        </div>
      </section>
    </main>
  );
}
