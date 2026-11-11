"use client";

import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineLoading } from "react-icons/ai";
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";

export default function LikeBtn({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);

  const load = async () => {
    const snap = await getDocs(query(collection(db, "likes"), where("postId", "==", postId)));
    setTotalLikes(snap.size);
    const uid = auth.currentUser?.uid;
    setHasUserLiked(!!uid && snap.docs.some((d) => (d.data() as any).uid === uid));
  };

  useEffect(() => { if (postId) load(); }, [postId]);

  const toggleLike = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Vui lòng đăng nhập!");
    setLoading(true);
    const likesRef = collection(db, "likes");
    if (hasUserLiked) {
      const snap = await getDocs(query(likesRef, where("postId", "==", postId), where("uid", "==", user.uid)));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "likes", d.id))));
    } else {
      await addDoc(likesRef, { postId, uid: user.uid, createdAt: new Date() });
    }
    await load();

    // Update likes count in post document
    try {
      const { updateDoc, doc: firestoreDoc, collection: firestoreCollection, query: firestoreQuery, where: firestoreWhere, getDocs: firestoreGetDocs } = await import("firebase/firestore");
      const postsRef = firestoreCollection(db, "posts");
      const q = firestoreQuery(postsRef, firestoreWhere("slug", "==", postId));
      const postSnap = await firestoreGetDocs(q);
      if (!postSnap.empty) {
        const postDoc = postSnap.docs[0];
        await updateDoc(firestoreDoc(db, "posts", postDoc.id), {
          likes: totalLikes + (hasUserLiked ? -1 : 1)
        });
      }
    } catch (err) {
      console.error("Error updating post likes count:", err);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        onClick={toggleLike}
        disabled={loading}
        aria-pressed={hasUserLiked}
        aria-label={hasUserLiked ? "Bỏ thích" : "Thích bài viết"}
        className={`group inline-flex items-center gap-3 rounded-full border px-6 py-3 font-medium transition-all ${
          hasUserLiked
            ? "border-transparent bg-gradient-to-r from-lavender-400 to-rose-400 text-white shadow-st-hover"
            : "border-st-line bg-st-surface text-st-ink hover:-translate-y-0.5 hover:border-rose-400"
        }`}
      >
        {loading ? (
          <AiOutlineLoading className="h-5 w-5 animate-spin" />
        ) : hasUserLiked ? (
          <AiFillHeart className="h-5 w-5" />
        ) : (
          <AiOutlineHeart className="h-5 w-5 text-rose-500 transition-transform group-hover:scale-110" />
        )}
        <span>{hasUserLiked ? "Đã thích" : "Thích bài này"}</span>
        <span className="font-mono text-sm opacity-80">{totalLikes}</span>
      </button>
    </div>
  );
}
