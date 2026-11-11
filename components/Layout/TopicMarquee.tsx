"use client";

import Link from "next/link";

export default function TopicMarquee({ topics }: { topics: string[] }) {
  const displayTopics =
    topics.length > 0
      ? topics
      : ["AI", "Deep Learning", "NLP", "RAG", "LLM", "Python", "Machine Learning", "Transformers"];

  // repeat so the loop is seamless even with few topics
  const repeat = Math.max(2, Math.ceil(16 / displayTopics.length));
  const items = Array.from({ length: repeat }, () => displayTopics).flat();

  return (
    <div className="st-fade-x mt-6 -mx-2 overflow-hidden py-3">
      <div className="group flex w-max [--gap:0.75rem] [gap:var(--gap)]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 animate-marquee [gap:var(--gap)] group-hover:[animation-play-state:paused]"
            aria-hidden={copy === 1}
          >
            {items.map((topic, i) => (
              <Link
                key={`${copy}-${topic}-${i}`}
                href={`/search?q=${encodeURIComponent(topic)}`}
                className="st-topic"
                tabIndex={copy === 1 ? -1 : undefined}
              >
                <i>#</i>
                {topic}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
