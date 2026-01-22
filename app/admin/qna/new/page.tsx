"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import TiptapEditor from "@/components/Blog/TiptapEditor";
import { toast } from "react-hot-toast";

export default function NewQnaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [source, setSource] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim() || !topic.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "interview_qna"), {
                question: question.trim(),
                answer: answer, // HTML from Tiptap
                topic: topic.trim(),
                difficulty,
                source: source.trim(),
                createdAt: serverTimestamp(),
                views: 0
            });

            toast.success("Đã thêm câu hỏi mới thành công!");
            // Reset form
            setQuestion("");
            setAnswer("");
            setSource("");
            // Keep topic/difficulty for faster entry of same category
        } catch (error) {
            console.error("Lỗi khi thêm Q&A:", error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Thêm Câu Hỏi Mới
                </h1>
                <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ← Quay lại Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Câu hỏi */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Câu hỏi
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ví dụ: RAG là gì và tại sao nó giảm Hallucination?"
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        required
                    />
                </div>

                {/* Thông tin metadata */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Chủ đề (Topic)
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="NLP, RAG, Python..."
                            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Độ khó
                        </label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        >
                            <option value="Easy">Dễ (Fresher)</option>
                            <option value="Medium">Vừa (Junior)</option>
                            <option value="Hard">Khó (Senior/Expert)</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nguồn (Optional)
                        </label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="Link github, blog..."
                            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Editor Câu trả lời */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Câu trả lời chi tiết
                    </label>
                    <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
                        <TiptapEditor
                            value={answer}
                            onChange={setAnswer}
                            placeholder="Nhập câu trả lời chi tiết tại đây..."
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
                    >
                        {loading ? "Đang lưu..." : "Lưu Câu Hỏi"}
                    </button>
                </div>
            </form>
        </div>
    );
}
