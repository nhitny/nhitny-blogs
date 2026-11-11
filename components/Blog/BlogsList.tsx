"use client";

import { useState } from "react";
import BlogHeader from "@/components/Blog/BlogHeader";
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
                    className={`st-page-btn${currentPage === i ? " is-current" : ""}`}
                    aria-current={currentPage === i ? "page" : undefined}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentBlogs.map((b: any, i: number) => (
                    <BlogHeader key={b.id} data={b} index={startIndex + i} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="st-page-btn"
                    >
                        <FiChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Trước</span>
                    </button>

                    {renderPageNumbers()}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="st-page-btn"
                    >
                        <span className="hidden sm:inline">Sau</span>
                        <FiChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </>
    );
}
