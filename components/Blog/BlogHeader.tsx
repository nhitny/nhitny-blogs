import Link from "next/link";
import { FiEye, FiHeart, FiMessageCircle, FiArrowRight } from "react-icons/fi";

function minutesRead(html?: string) {
  if (!html) return 3;
  const words = html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
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

export default function BlogHeader({ data, index = 0 }: { data: BlogData; index?: number }) {
  const slug =
    data.slug ||
    String(data.title || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const description =
    data.description || (data.content ? data.content.replace(/<[^>]+>/g, "").slice(0, 140) + "…" : "");

  const tags = data.tags || [];
  // a big outlined letter from the first tag gives each card its own "cover"
  const glyph = (tags[0] || data.title || "N").replace(/^#/, "").charAt(0).toUpperCase();

  return (
    <article className="st-post group">
      <Link href={`/blogs/${slug}`} className="st-post-cover block" aria-hidden="true" tabIndex={-1}>
        <div className="st-post-tokens">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="st-hash">
              #{tag}
            </span>
          ))}
        </div>
        <span className="st-post-glyph">{glyph}</span>
        <span className="absolute bottom-3 left-4 font-mono text-[0.7rem] text-st-muted">
          {String(index + 1).padStart(2, "0")} / {minutesRead(data.content)} phút đọc
        </span>
      </Link>

      <div className="st-post-body">
        <div className="st-post-meta">
          <span>{getRelativeTime(data.date)}</span>
          {data.topic && (
            <>
              <span className="dot" />
              <span className="text-st-rose">{data.topic}</span>
            </>
          )}
        </div>

        <h3 className="line-clamp-2">
          <Link href={`/blogs/${slug}`}>{data.title}</Link>
        </h3>

        <p className="line-clamp-3">{description}</p>
      </div>

      <div className="st-post-foot">
        <div className="st-stats">
          <span title="Lượt xem">
            <FiEye /> {data.views || 0}
          </span>
          <span title="Lượt thích">
            <FiHeart /> {data.likes || 0}
          </span>
          <span title="Bình luận">
            <FiMessageCircle /> {data.commentsCount || 0}
          </span>
        </div>
        <Link href={`/blogs/${slug}`} className="st-link">
          Đọc <FiArrowRight />
        </Link>
      </div>
    </article>
  );
}
