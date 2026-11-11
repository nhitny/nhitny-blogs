import { getAllBlogPosts } from "@/Lib/Data";
import BlogHeader from "@/components/Blog/BlogHeader";
import Hero from "@/components/Layout/Hero";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import TopicMarquee from "@/components/Layout/TopicMarquee";
import { SoftBackground, Reveal, Journey, ChapterMark } from "@/components/Soft/Soft";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getAllBlogPosts();
  // derive topics from the posts we already have (avoids a second round of Firestore reads)
  const topics = Array.from(
    new Set(posts.flatMap((p: any) => (Array.isArray(p.tags) ? p.tags : [])).filter(Boolean))
  ).sort() as string[];

  const latestPosts = posts.slice(0, 3);
  const featuredPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  return (
    <main className="st-home flex min-h-screen flex-col">
      <SoftBackground />
      <Hero postCount={posts.length} topicCount={topics.length} />

      <Reveal>
        <Journey>
          {/* ---------- 01 FEATURED ---------- */}
          <section className="st-wrap st-section st-chapter st-reveal">
            <ChapterMark n="01" name="nổi bật" note="được đọc nhiều nhất" />
            <h2 className="st-h2">
              Bài viết <em>nổi bật</em>
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.length > 0 ? (
                featuredPosts.map((post: any, i: number) => (
                  <BlogHeader key={`featured-${post.id}`} data={post} index={i} />
                ))
              ) : (
                <p className="st-body">Chưa có bài viết nổi bật nào.</p>
              )}
            </div>
          </section>

          {/* ---------- 02 TOPICS ---------- */}
          <section className="st-wrap st-section st-chapter pt-0 st-reveal">
            <ChapterMark n="02" name="chủ đề" note="lối rẽ để khám phá" />
            <h2 className="st-h2">
              Chủ đề <em>khám phá</em>
            </h2>
            <TopicMarquee topics={topics} />
          </section>

          {/* ---------- 03 LATEST ---------- */}
          <section className="st-wrap st-section st-chapter st-chapter-last pt-0 st-reveal">
            <ChapterMark n="03" name="mới nhất" note="vừa viết xong, còn nóng hổi" final />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="st-h2 !mb-0">
                Mới <em>cập nhật</em>
              </h2>
              <Link href="/blogs" className="st-btn ghost">
                Xem tất cả <FiArrowRight />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((b: any, i: number) => (
                <BlogHeader key={b.id} data={b} index={i} />
              ))}
            </div>
          </section>
        </Journey>
      </Reveal>
    </main>
  );
}
