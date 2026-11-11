"use client";

import { ReactNode, useEffect, useRef } from "react";

/** Soft dotted background + floating blobs (shared with the portfolio). */
export function SoftBackground() {
  return (
    <div className="st-bg" aria-hidden="true">
      <span className="st-blob b1" />
      <span className="st-blob b2" />
      <span className="st-blob b3" />
    </div>
  );
}

/** Fade `.st-reveal` children in as they scroll into view. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".st-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Scroll-driven journey rail around `.st-chapter` sections. */
export function Journey({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>(".st-chapter"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight * 0.55;
      chapters.forEach((ch) => {
        const r = ch.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
        ch.style.setProperty("--p", p.toFixed(3));
        ch.classList.toggle("is-active", r.top < mid);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="st-journey" ref={ref}>
      {children}
    </div>
  );
}

/** Milestone marker at the top of a journey chapter. */
export function ChapterMark({
  n,
  name,
  note,
  final = false,
}: {
  n: string;
  name: string;
  note?: string;
  final?: boolean;
}) {
  return (
    <div className={`st-chapter-mark${final ? " is-final" : ""}`}>
      <span className="st-node" aria-hidden="true">
        {final ? "✦" : ""}
      </span>
      <span className="st-chapter-num" aria-hidden="true">
        {n}
      </span>
      <span className="st-chapter-meta">
        <span className="st-chapter-kicker">chương {n}</span>
        <b>{name}</b>
        {note && <i>{note}</i>}
      </span>
    </div>
  );
}

/** Header used by inner pages (Bài viết, Giới thiệu, Tìm kiếm, ...). */
export function PageHead({
  label,
  title,
  accent,
  subtitle,
  children,
}: {
  label: string;
  title: string;
  accent?: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="st-wrap st-page-head">
      <span className="st-label">{label}</span>
      <h1 className="st-page-title">
        {title} {accent && <em>{accent}</em>}
      </h1>
      {subtitle && <p className="st-body st-page-sub">{subtitle}</p>}
      {children}
    </div>
  );
}
