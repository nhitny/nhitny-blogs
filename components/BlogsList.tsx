"use client";

import { useState } from "react";
import BlogHeader from "@/components/BlogHeader";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface BlogsListProps {
    blogs: any[];
}

const POSTS_PER_PAGE = 9;

export default function BlogsList({ blogs }: BlogsListProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const currentBlogs = blogs.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === i
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-indigo-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    return (
        <>
            {/* Blog Grid */}
            <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {currentBlogs.map((b: any) => (
                    <BlogHeader key={b.id} data={b} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Trước</span>
                    </button>

                    {renderPageNumbers()}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="hidden sm:inline">Sau</span>
                        <FiChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </>
    );
}
