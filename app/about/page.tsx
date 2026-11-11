import Image from "next/image";
import Link from "next/link";
import { FiGithub, FiLinkedin, FiMail, FiArrowUpRight, FiArrowRight } from "react-icons/fi";
import { SoftBackground, Reveal, Journey, ChapterMark } from "@/components/Soft/Soft";

export const metadata = {
  title: "Giới thiệu",
  description: "Yến Nhi (Nhitny) — AI Engineer, nghiên cứu NLP, RAG và LLMs.",
};

const SKILLS = [
  { group: "AI & NLP", items: ["PyTorch", "Transformers", "RAG pipelines", "LLM fine-tuning", "TensorFlow"] },
  { group: "Data & ML", items: ["Python", "scikit-learn", "Pandas", "NumPy"] },
  { group: "Build & Play", items: ["React / Next.js", "Firebase", "Docker", "Arduino / IoT", "Scratch"] },
];

const MILESTONES = [
  { year: "2026", title: "Top 3 · VLSP 2026", desc: "Task 3 — Speech Quality Assessment." },
  { year: "2025", title: "Paper DFAT @ VLSP 2025", desc: "Kết hợp đặc trưng âm thanh và văn bản để nhận diện cảm xúc trong giọng nói." },
  { year: "2024", title: "Thạc sĩ KHMT @ UIT – VNU-HCM", desc: "Hướng nghiên cứu NLP, mô hình ngôn ngữ và generative AI." },
  { year: "2023", title: "Kỹ sư CNTT @ ĐH Sài Gòn", desc: "Chương trình chất lượng cao." },
];

export default function AboutPage() {
  return (
    <main className="st-home st-page">
      <SoftBackground />

      {/* ---------- intro ---------- */}
      <section className="st-wrap st-page-head">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="st-label">~/about</span>
            <h1 className="st-page-title">
              Xin chào, mình là <em>Yến Nhi.</em>
            </h1>
            <p className="st-lead !max-w-xl">
              <b>AI Engineer</b> và học viên thạc sĩ Khoa học Máy tính tại <b>UIT – VNU-HCM</b>. Mình mê cách máy
              móc hiểu ngôn ngữ — từ <b>NLP, RAG</b> đến <b>LLMs</b> — và blog này là nơi mình ghi lại hành trình đó.
            </p>
            <div className="st-cta">
              <a href="https://nhitny.github.io" target="_blank" rel="noreferrer" className="st-btn primary">
                Xem portfolio <FiArrowUpRight />
              </a>
              <a href="https://github.com/nhitny" target="_blank" rel="noreferrer" className="st-btn ghost">
                <FiGithub /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/nhitny2802/" target="_blank" rel="noreferrer" className="st-btn ghost">
                <FiLinkedin /> LinkedIn
              </a>
              <a href="mailto:nhitny.vn@gmail.com" className="st-btn ghost">
                <FiMail /> Email
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="st-avatar !w-[min(70%,300px)] lg:!w-[min(100%,380px)]">
              <div className="st-avatar-ring" />
              <div className="st-avatar-blob" />
              <Image src="/chibi.webp" alt="Minh hoạ Yến Nhi" width={516} height={800} priority />
              <span className="st-chip c1"><i>●</i>NLP</span>
              <span className="st-chip c2"><i>●</i>speech</span>
              <span className="st-chip c4"><i>●</i>RAG</span>
            </div>
          </div>
        </div>
      </section>

      <Reveal>
        <Journey>
          {/* ---------- 01 why ---------- */}
          <section className="st-wrap st-section st-chapter pt-0 st-reveal">
            <ChapterMark n="01" name="vì sao có blog này" note="kiến thức là một hành trình dài" />
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="st-h2">
                  Viết để <em>hiểu</em>, chia sẻ để <em>nhớ</em>.
                </h2>
                <p className="st-body">
                  Mỗi bài ở đây là một lần mình ngồi gỡ rối một khái niệm — reranker trong RAG, ensemble learning,
                  attention… — rồi viết lại bằng ngôn ngữ của mình. Nếu nó giúp được ai đó hiểu nhanh hơn một chút, thế
                  là vui rồi.
                </p>
                <p className="st-body">
                  Mọi thứ là góc nhìn cá nhân trong quá trình tự học, nên rất mong nhận được góp ý của bạn.
                </p>
              </div>
              <div className="grid gap-5">
                {SKILLS.map(({ group, items }) => (
                  <div key={group} className="st-tool-group">
                    <h4>{group}</h4>
                    <div className="st-tags">
                      {items.map((name) => (
                        <span key={name} className="st-tag">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- 02 milestones ---------- */}
          <section className="st-wrap st-section st-chapter pt-0 st-reveal">
            <ChapterMark n="02" name="cột mốc" note="vài điểm dừng trên đường" />
            <div className="grid gap-4 md:grid-cols-2">
              {MILESTONES.map((m) => (
                <div key={m.title} className="st-card p-6">
                  <span className="font-serif text-3xl italic text-st-accent">{m.year}</span>
                  <h3 className="mt-2 font-serif text-xl font-medium text-st-ink">{m.title}</h3>
                  <p className="mt-1 text-st-muted">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 03 say hi ---------- */}
          <section className="st-wrap st-section st-chapter st-chapter-last pt-0 st-reveal">
            <ChapterMark n="03" name="trò chuyện" note="mình luôn vui khi nghe từ bạn" final />
            <div className="st-connect">
              <h2 className="st-h2">
                Cùng nói chuyện về <em>AI</em> nhé.
              </h2>
              <p className="st-body mx-auto max-w-lg">Góp ý bài viết, hỏi han, hay chỉ muốn chào — email luôn mở.</p>
              <div className="st-socials">
                <a href="mailto:nhitny.vn@gmail.com" className="st-social">
                  <FiMail /> nhitny.vn@gmail.com
                </a>
                <Link href="/blogs" className="st-social">
                  Đọc bài viết <FiArrowRight />
                </Link>
              </div>
            </div>
          </section>
        </Journey>
      </Reveal>
    </main>
  );
}
