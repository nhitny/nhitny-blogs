import Link from "next/link";

function minutesRead(html?: string) {
  if (!html) return "3 min read";
  const words = html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(2, Math.round(words / 220));
  return `${mins} min read`;
}

export default function BlogHeader({ data }: { data: any }) {
  const slug =
    data.slug ||
    String(data.title || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl bg-[#121826] p-6 shadow-sm ring-1 ring-gray-800/80 transition hover:-translate-y-0.5 hover:shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
      {/* Tag */}
      {data.topic && (
        <span className="inline-block rounded-full bg-[#6C63FF]/20 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#B6B4FF]">
          {String(data.topic)}
        </span>
      )}

      {/* Title */}
      <h3 className="mt-4 text-[22px] font-bold leading-snug text-gray-100 group-hover:text-indigo-300">
        <Link href={`/blogs/${slug}`} className="no-underline">
          {data.title}
        </Link>
      </h3>

      {/* Excerpt */}
      <p className="mt-2 text-[14px] leading-6 text-gray-400 line-clamp-3">
        {data.description || "No description."}
      </p>

      {/* Footer */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/blogs/${slug}`}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-indigo-300 hover:text-indigo-200 no-underline"
          >
            Learn More <span aria-hidden>→</span>
          </Link>
          <span className="text-[12px] tracking-[0.18em] text-gray-400">
            {minutesRead(data.content)}
          </span>
        </div>

        {/* underline bar giống demo */}
        <div className="mt-2 h-[2px] w-40 bg-indigo-400/50 transition-[width] duration-300 group-hover:w-48" />
      </div>
    </article>
  );
}
