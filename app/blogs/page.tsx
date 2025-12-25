import BlogHeader from "@/components/BlogHeader";
import { getAllBlogPosts, getAllTopics } from "@/Lib/Data";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await getAllBlogPosts();

  return (
    <>
      {/* HERO */}
      <section className="relative bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-28 sm:pb-12">
          <h1 className="mt-2 text-center text-4xl font-bold tracking-tight sm:mt-0 sm:text-6xl">
            <span className="text-gray-900 dark:text-gray-100">Danh sách </span>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Bài viết
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400">
            Tổng hợp các bài viết và ghi chú về Deep Learning, NLP, LLMs và Công nghệ trong quá trình nghiên cứu.
          </p>
        </div>
      </section>

      {/* GRID */}
      <main className="mx-auto max-w-[1400px] px-6 pb-20">
        <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b: any) => (
            <BlogHeader key={b.id} data={b} />
          ))}
        </div>
      </main>
    </>
  );
}
