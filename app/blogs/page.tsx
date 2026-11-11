import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import BlogsList from "@/components/Blog/BlogsList";
import InterviewSection from "@/components/Blog/InterviewSection";
import { getAllBlogPosts } from "@/Lib/Data";
import { SoftBackground, PageHead, Reveal, Journey, ChapterMark } from "@/components/Soft/Soft";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const blogs = await getAllBlogPosts();

  return (
    <main className="st-home st-page">
      <SoftBackground />
      <PageHead
        label="~/blogs"
        title="Danh sách"
        accent="bài viết."
        subtitle="Ghi chú về Deep Learning, NLP, LLMs và công nghệ — viết lại trong quá trình nghiên cứu."
      >
        <Link href="/search" className="st-btn ghost mt-2">
          <FiSearch /> Tìm bài viết
        </Link>
      </PageHead>

      <Reveal>
        <Journey>
          <section className="st-wrap st-section st-chapter pt-0 st-reveal">
            <ChapterMark n="01" name="tất cả bài viết" note={`${blogs.length} ghi chép, mới nhất trước`} />
            <BlogsList blogs={blogs} />
          </section>

          <section className="st-wrap st-section st-chapter st-chapter-last pt-0 st-reveal">
            <ChapterMark n="02" name="phỏng vấn" note="câu hỏi thật, trả lời gọn" final />
            <InterviewSection />
          </section>
        </Journey>
      </Reveal>
    </main>
  );
}
