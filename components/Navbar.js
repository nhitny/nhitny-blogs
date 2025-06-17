// ✅ components/Navbar.js
import Link from "next/link";

export default function Navbar({ topics = [] }) {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">My Blog</Link>
        <div className="space-x-4">
          <Link href="/">Home</Link>
          <Link href="/blogs">Blogs</Link>
          <Link href="/admin/login">Admin</Link>
          {/* Dropdown topic - optional */}
          {topics.length > 0 && (
            <div className="inline-block relative">
              <button className="px-2 py-1 bg-gray-700 rounded">Topics</button>
              <ul className="absolute hidden group-hover:block bg-white text-black mt-2 rounded shadow">
                {topics.map(topic => (
                  <li key={topic} className="px-4 py-2 hover:bg-gray-200">
                    <Link href={`/topic/${topic}`}>{topic}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
