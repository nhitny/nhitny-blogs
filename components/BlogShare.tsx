import { FaTwitter } from "react-icons/fa";

export default function BlogShare({ data }: { data: { Title: string; Tags: string } }) {
  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${data.Title} by @soumyajit4419`
  )}&url=${encodeURIComponent(
    `blogs.soumya-jit.tech/blogs/${data.Title.split(" ").join("-").toLowerCase()}`
  )}&hashtags=${encodeURIComponent(data.Tags.split(" ").join(","))}`;
  return (
    <div className="pb-4 text-center">
      <a
        className="inline-flex items-center space-x-2 rounded bg-indigo-500 px-3 py-1 font-semibold text-white"
        rel="noopener noreferrer"
        target="_blank"
        href={href}
      >
        <FaTwitter />
        <span>Tweet</span>
      </a>
    </div>
  );
}
