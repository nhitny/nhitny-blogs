"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";

interface Post {
    id: string;
    title: string;
    description: string;
    tags: string[];
    slug: string;
    headerImage?: string;
}

import TechBackground from "@/components/TechBackground";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams?.get("q") || "";
    const searchBoxRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [results, setResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [allPosts, setAllPosts] = useState<Post[]>([]);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const postsRef = collection(db, "posts");
                const snapshot = await getDocs(postsRef);
                const posts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[];
                setAllPosts(posts);
            } catch (error) {
                console.error("Error loading posts:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    useEffect(() => {
        if (allPosts.length > 0 && initialQuery) {
            const query = initialQuery.toLowerCase();
            const filtered = allPosts.filter((post) => {
                const titleMatch = post.title?.toLowerCase().includes(query);
                const descMatch = post.description?.toLowerCase().includes(query);
                const tagsMatch = post.tags?.some((tag) =>
                    tag.toLowerCase().includes(query)
                );
                return titleMatch || descMatch || tagsMatch;
            });
            setResults(filtered);
        } else if (allPosts.length > 0 && !initialQuery) {
            setResults([]);
        }
    }, [allPosts, initialQuery]);

    // Click outside handler - navigate back to /blogs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
                router.push('/blogs');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [router]);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = allPosts.filter((post) => {
            const titleMatch = post.title?.toLowerCase().includes(query);
            const descMatch = post.description?.toLowerCase().includes(query);
            const tagsMatch = post.tags?.some((tag) =>
                tag.toLowerCase().includes(query)
            );
            return titleMatch || descMatch || tagsMatch;
        });
        setResults(filtered);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-x-0 top-0 h-[500px] z-0 opacity-30 dark:opacity-40 pointer-events-none">
                <TechBackground />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-20">
                {/* Search Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Tìm kiếm
                        </span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Khám phá các bài viết, kiến thức và công nghệ
                    </p>
                </div>

                {/* Search Input Box */}
                <div ref={searchBoxRef} className="relative mx-auto max-w-2xl transform transition-all focus-within:scale-105">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 to-purple-600 blur opacity-20 rounded-2xl"></div>
                    <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80">
                        <FiSearch className="ml-4 h-6 w-6 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập từ khóa (React, AI, CSS...)"
                            className="w-full bg-transparent px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
                        />
                        <button
                            onClick={handleSearch}
                            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="mt-16">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                            <p className="mt-4 text-gray-500 animate-pulse">Đang tìm dữ liệu...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                    {results.length}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Kết quả được tìm thấy</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {results.map((post, index) => (
                                    <Link
                                        key={post.id}
                                        href={`/blogs/${post.slug}`}
                                        className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-indigo-500/30"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            {post.headerImage && (
                                                <div className="h-48 w-full sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl">
                                                    <img
                                                        src={post.headerImage}
                                                        alt={post.title}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {post.tags?.map((tag, idx) => (
                                                        <span key={idx} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {post.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : searchQuery ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                            <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                                <FiSearch className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Không tìm thấy kết quả</h3>
                            <p className="mt-1 text-gray-500">
                                Thử tìm với từ khóa khác như &ldquo;React&rdquo;, &ldquo;AI&rdquo;, &ldquo;Basic&rdquo;...
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                            <FiSearch className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                            <p className="text-lg text-gray-500">Nhập từ khóa để bắt đầu khám phá</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <SearchContent />
        </Suspense>
    );
}
