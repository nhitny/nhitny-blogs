"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import TiptapEditor from "@/components/Blog/TiptapEditor";
import { toast } from "react-hot-toast";
import { FiEdit, FiEye, FiChevronDown } from "react-icons/fi";

export default function EditQnaPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [source, setSource] = useState("");

    // Fetch question data
    useEffect(() => {
        const fetchQuestion = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "interview_qna", id);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    const data = snap.data();
                    setQuestion(data.question || "");
                    setAnswer(data.answer || "");
                    setTopic(data.topic || "");
                    setDifficulty(data.difficulty || "Medium");
                    setSource(data.source || "");
                } else {
                    toast.error("Không tìm thấy câu hỏi!");
                    router.push("/admin/dashboard/qna");
                }
            } catch (error) {
                console.error("Error fetching question:", error);
                toast.error("Lỗi khi tải dữ liệu!");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim() || !topic.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setSaving(true);
        try {
            const docRef = doc(db, "interview_qna", id);
            await updateDoc(docRef, {
                question: question.trim(),
                answer: answer,
                topic: topic.trim(),
                difficulty,
                source: source.trim(),
                updatedAt: serverTimestamp(),
            });

            toast.success("Cập nhật thành công!");

            // Redirect back to dashboard
            setTimeout(() => {
                router.push("/admin/dashboard/qna");
            }, 1000);

        } catch (error) {
            console.error("Lỗi khi cập nhật Q&A:", error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Chỉnh Sửa Câu Hỏi
                </h1>
                <button
                    onClick={() => router.push("/admin/dashboard/qna")}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ← Quay lại Dashboard
                </button>
            </div>

            {/* Toggle Tabs */}
            <div className="mb-6 flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 w-fit">
                <button
                    onClick={() => setActiveTab("write")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "write"
                            ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                >
                    <FiEdit className="h-4 w-4" /> Viết
                </button>
                <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "preview"
                            ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                >
                    <FiEye className="h-4 w-4" /> Xem trước
                </button>
            </div>

            {activeTab === "preview" ? (
                /* PREVIEW CARD - Replicating Interview Page Style */
                <div className="group overflow-hidden rounded-2xl border bg-white border-indigo-200 shadow-xl shadow-indigo-100/50 dark:bg-gray-800 dark:border-indigo-500/30 dark:shadow-none animate-fade-in">
                    <div className="flex items-start justify-between p-6 md:p-7 relative">
                        {/* Side Highlight Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600"></div>

                        <div className="flex-1 pr-6 pl-2">
                            <div className="mb-3 flex items-center gap-3 flex-wrap">
                                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide uppercase shadow-sm
                                    ${difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                                        difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                                            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}
                                 `}>
                                    {difficulty}
                                </span>
                                <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 shadow-sm dark:bg-gray-700 dark:text-gray-300">
                                    #{topic || "Topic"}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold leading-snug text-indigo-700 dark:text-indigo-300">
                                {question || "Tiêu đề câu hỏi sẽ xuất hiện ở đây..."}
                            </h3>
                        </div>
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300 rotate-180">
                            <FiChevronDown className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700/50">
                        <div className="bg-gray-50/50 p-6 md:p-8 dark:bg-gray-900/30">
                            {answer ? (
                                <div
                                    className="prose prose-lg prose-indigo max-w-none dark:prose-invert 
                                    prose-headings:font-bold prose-headings:text-gray-800 dark:prose-headings:text-gray-100
                                    prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                                    prose-code:text-indigo-600 dark:prose-code:text-indigo-300
                                    prose-pre:bg-gray-900 dark:prose-pre:bg-black/50 prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700/50"
                                    dangerouslySetInnerHTML={{ __html: answer }}
                                />
                            ) : (
                                <p className="text-gray-400 italic">Nội dung câu trả lời sẽ xuất hiện ở đây...</p>
                            )}
                        </div>
                        <div className="bg-gray-100/50 px-8 py-3 dark:bg-gray-800/50 flex justify-end">
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Nhitny Blog • Interview Library
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Câu hỏi */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Câu hỏi
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Nhập câu hỏi..."
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
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
                        >
                            {saving ? "Đang lưu..." : "Cập nhật"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
