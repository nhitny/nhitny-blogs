import Link from "next/link";

function minutesRead(html?: string) {
  if (!html) return "3 min read";
  const words = html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(2, Math.round(words / 220));
  return `${mins} min read`;
}

function getRelativeTime(dateString?: string | any) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "vừa xong";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}

export interface BlogData {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  topic?: string;
  slug?: string;
  date?: any;
  tags?: string[];
  views?: number;
  likes?: number;
  commentsCount?: number;
  author?: string;
}

export default function BlogHeader({ data }: { data: BlogData }) {
  const slug = data.slug ||
    String(data.title || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, "-");

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-[#121826] dark:ring-gray-800/80 dark:hover:shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
      <div className="mb-1 flex h-[40px] items-start justify-between gap-2 overflow-hidden">
        <div className="flex flex-wrap gap-2">
          {data.tags && data.tags.length > 0 && (
            <>
              {data.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[13px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 h-fit"
                >
                  🏷️ {tag}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Relative Time */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pt-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{getRelativeTime(data.date)}</span>
        </div>
      </div>

      {data.topic && (
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-indigo-600 dark:bg-[#6C63FF]/20 dark:text-[#B6B4FF]">
          {data.topic}
        </span>
      )}
      <h3 className="mt-2 h-[96px] text-[22px] font-bold leading-snug text-gray-900 group-hover:text-indigo-600 text-justify dark:text-gray-100 dark:group-hover:text-indigo-300 line-clamp-3 overflow-hidden">
        <Link href={`/blogs/${slug}`} className="no-underline">
          {data.title}
        </Link>
      </h3>
      <p className="mt-2 h-[96px] text-[14px] leading-6 text-gray-600 text-justify line-clamp-4 dark:text-gray-400 overflow-hidden">
        {data.description || "No description."}
      </p>

      {/* Stats: Views, Likes, Comments */}
      <div className="mt-4 flex items-center gap-4 text-[13px] text-gray-600 dark:text-gray-400">
        <div className="flex min-w-[60px] items-center gap-1.5">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{data.views || 0}</span>
        </div>
        <div className="flex min-w-[60px] items-center gap-1.5">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{data.likes || 0}</span>
        </div>
        <div className="flex min-w-[60px] items-center gap-1.5">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span>{data.commentsCount || 0}</span>
        </div>
      </div>

      {/* Read More Link */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Link
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200 no-underline"
        >
          Đọc tiếp <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
