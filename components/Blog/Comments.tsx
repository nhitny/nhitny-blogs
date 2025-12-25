"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FiTrash2, FiSend } from "react-icons/fi";
import Link from "next/link";
import UserAvatar from "@/components/Layout/UserAvatar";
import FunTechLoader from "@/components/UI/FunTechLoader";

interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: any;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments in real-time
  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentsRef = collection(db, "posts", postId, "comments");
      await addDoc(commentsRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        userPhoto: user.photoURL || "",
        content: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      // Update comment count on post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Không thể thêm bình luận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId));

      // Update comment count on post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentsCount: increment(-1)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Không thể xóa bình luận. Vui lòng thử lại.");
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Bình luận ({comments.length})
      </h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex gap-3">
            <UserAvatar
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="h-10 w-10"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="h-4 w-4" />
                      <span>Gửi bình luận</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Bạn cần{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              đăng nhập
            </Link>{" "}
            để bình luận
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <FunTechLoader />
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <UserAvatar
                src={comment.userPhoto}
                alt={comment.userName}
                className="h-10 w-10"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {comment.userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {user && user.uid === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      aria-label="Delete comment"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
