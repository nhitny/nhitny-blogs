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
    <div className="flex items-center justify-center pt-16 pb-6">
      {loading ? (
        <AiOutlineLoading className="animate-spin" style={{ fontSize: "1.5rem" }} />
      ) : (
        <>
          <button onClick={toggleLike} disabled={loading}>
            {hasUserLiked ? (
              <AiFillHeart style={{ fontSize: "2rem", color: "rgba(220, 38, 38)" }} />
            ) : (
              <AiOutlineHeart style={{ fontSize: "2rem" }} />
            )}
          </button>
          <span style={{ fontSize: "1rem", paddingLeft: "16px" }}>{totalLikes}</span>
        </>
      )}
    </div>
  );
}
