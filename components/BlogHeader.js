import Link from "next/link";

export default function BlogHeader({ data }) {
  const slug = data?.slug || "no-slug";

  let tags = [];
  if (Array.isArray(data.tags)) {
    try {
      tags = JSON.parse(data.tags[0]);
    } catch (e) {
      console.error("Failed to parse tags:", data.tags);
    }
  } else if (typeof data.tags === "string") {
    try {
      tags = JSON.parse(data.tags);
    } catch (e) {
      console.error("Failed to parse tags string:", data.tags);
    }
  } else {
    tags = [];
  }

  const tag = tags[0] || "general";

  return (
    <Link href={`/blogs/${slug}`} className="block group border rounded-lg overflow-hidden hover:shadow-lg transition">
      {data.thumbnail && (
        <div className="relative w-full h-48">
          <img
            src={data.thumbnail.trim()}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
          {tag}
        </span>
        <h2 className="mt-2 font-bold text-lg group-hover:text-indigo-600">
          {data.title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {data.description || "No description."}
        </p>
      </div>
    </Link>
  );
}
