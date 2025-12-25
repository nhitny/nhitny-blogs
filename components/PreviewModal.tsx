"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        title: string;
        description?: string;
        headerImage?: string;
        tags: string[];
        author?: string;
        content: string;
    };
}

export default function PreviewModal({ isOpen, onClose, post }: PreviewModalProps) {
    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">👁️ Xem trước bài viết</h2>
                        <p className="text-sm text-indigo-100 mt-1">Đây là cách bài viết sẽ hiển thị cho người đọc</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                        aria-label="Đóng"
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-8 bg-gray-50 dark:bg-gray-950">
                    {/* Article Container */}
                    <article className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
                        {/* Header Image */}
                        {post.headerImage && (
                            <div className="mb-8 -mx-8 -mt-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={post.headerImage}
                                    alt={post.title}
                                    className="w-full h-64 object-cover rounded-t-lg"
                                />
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
                            {post.title || "Untitled"}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                            {post.author && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">✍️ {post.author}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span>📅 {new Date().toLocaleDateString("vi-VN")}</span>
                            </div>
                        </div>

                        {/* Description */}
                        {post.description && (
                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic border-l-4 border-indigo-600 pl-4">
                                {post.description}
                            </p>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {post.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                prose-code:text-indigo-600 dark:prose-code:text-indigo-400
                prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800
                prose-img:rounded-lg prose-img:shadow-lg
              "
                            dangerouslySetInnerHTML={{ __html: post.content || "<p>Chưa có nội dung...</p>" }}
                        />
                    </article>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        💡 Đây chỉ là bản xem trước. Nhấn &quot;Đóng&quot; để quay lại chỉnh sửa.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
