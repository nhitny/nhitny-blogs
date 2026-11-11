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
    <div className="mt-4 border-t border-st-line pt-10">
      <h2 className="st-h2 !text-3xl">
        Bình luận <em>({comments.length})</em>
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
                className="st-input"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="st-btn primary sm disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="st-card mt-6 p-6 text-center">
          <p className="text-st-muted">
            Bạn cần{" "}
            <Link
              href="/login"
              className="st-link"
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
          <p className="py-8 text-center font-serif italic text-st-muted">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="st-card flex gap-3 p-5"
            >
              <UserAvatar
                src={comment.userPhoto}
                alt={comment.userName}
                className="h-10 w-10"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-st-ink">
                      {comment.userName}
                    </p>
                    <p className="font-mono text-xs text-st-muted">
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
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-st-ink">
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
