"use client";

import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiGithub, FiLinkedin, FiMail, FiSearch } from "react-icons/fi";

export default function Hero({ postCount = 0, topicCount = 0 }: { postCount?: number; topicCount?: number }) {
  return (
    <div className="st-wrap st-hero !min-h-0 !pb-6">
      <div className="grid w-full items-center gap-10 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <div className="st-kicker">
            <span className="st-pulse" />
            ~/nhitny-blog · a digital garden
          </div>

          <h1 className="st-title">
            Ghi lại hành trình <em>AI, NLP</em> &amp; Tech
            <span className="st-spark" aria-hidden="true">✦</span>
          </h1>

          <p className="st-lead">
            Nơi mình lưu lại những gì học được trên đường nghiên cứu <b>NLP, RAG và LLMs</b> — góc nhìn
            cá nhân, ghi chép tự học, hy vọng sẽ giúp ích được cho bạn.
          </p>

          <div className="st-cta">
            <Link href="/blogs" className="st-btn primary">
              Khám phá bài viết <FiArrowRight />
            </Link>
            <Link href="/search" className="st-btn ghost">
              <FiSearch /> Tìm kiếm
            </Link>
            <Link href="/about" className="st-btn ghost">
              Về tác giả
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 font-mono text-xs text-st-muted">
            <span>
              <b className="font-serif text-xl italic text-st-ink">{postCount}</b> bài viết
            </span>
            <span className="h-4 w-px bg-st-line" />
            <span>
              <b className="font-serif text-xl italic text-st-ink">{topicCount}</b> chủ đề
            </span>
            <span className="h-4 w-px bg-st-line" />
            <span className="flex items-center gap-3 text-base">
              <a href="https://github.com/nhitny" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-st-accent">
                <FiGithub />
              </a>
              <a href="https://www.linkedin.com/in/nhitny2802/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-st-accent">
                <FiLinkedin />
              </a>
              <a href="mailto:nhitny.vn@gmail.com" aria-label="Email" className="hover:text-st-accent">
                <FiMail />
              </a>
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="st-avatar !w-[min(70%,300px)] lg:!w-[min(100%,400px)]">
            <div className="st-avatar-ring" />
            <div className="st-avatar-blob" />
            <Image src="/chibi.webp" alt="Minh hoạ Yến Nhi" width={516} height={800} priority />
            <span className="st-chip c1">
              <i>●</i>RAG
            </span>
            <span className="st-chip c2">
              <i>●</i>LLMs
            </span>
            <span className="st-chip c3">
              <i>●</i>notes.md
            </span>
            <span className="st-chip c4">
              <i>●</i>NLP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
