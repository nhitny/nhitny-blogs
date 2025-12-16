"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import Alert from "@/components/Alert";

interface CommentDoc {
  id?: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt?: any;
  uid: string;
  postId: string;
}

export default function Comments({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [items, setItems] = useState<CommentDoc[]>([]);
  const [alert, setAlert] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false, type: "success", message: ""
  });

  const show = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert((s) => ({ ...s, show: false })), 1800);
  };

  const load = async () => {
    const snap = await getDocs(query(collection(db, "comments"), where("postId", "==", postId)));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as CommentDoc) })));
  };

  useEffect(() => { if (postId) load(); }, [postId]);

  const onPost = async () => {
    const user = auth.currentUser;
    if (!user) return show("error", "Vui lòng đăng nhập để bình luận");
    if (!comment.trim()) return;

    await addDoc(collection(db, "comments"), {
      postId,
      uid: user.uid,
      userName: user.displayName ?? "Anonymous",
      content: comment.trim(),
      createdAt: serverTimestamp(),
    } as CommentDoc);

    setComment("");
    show("success", "Đã gửi bình luận");
    await load();
  };

  const onDelete = async (id?: string, uid?: string) => {
    const user = auth.currentUser;
    if (!id) return;
    if (!user || user.uid !== uid) return show("error", "Bạn không thể xoá bình luận này");
    await deleteDoc(doc(db, "comments", id));
    await load();
  };

  return (
    <>
      <Alert show={alert.show} type={alert.type} message={alert.message} />
      <div className="mx-auto mt-6 mb-6 max-w-screen-md">
        <textarea
          className="mb-3 block w-full resize-none rounded border border-gray-100 bg-gray-100 p-3 leading-relaxed dark:border-gray-800 dark:bg-gray-800 dark:focus:border-gray-700"
          placeholder="What are your thoughts..?"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="text-right">
          <button className="mr-3 rounded bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white dark:bg-indigo-600" onClick={() => setComment("")}>
            Reset
          </button>
          <button className="rounded bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white dark:bg-indigo-600" onClick={onPost}>
            Post
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-screen-md">
        {items.map((c) => (
          <div className="space-y-4 py-3" key={c.id}>
            <div className="flex">
              <div className="mr-3 flex-shrink-0">
                {c.userImage ? (
                  <img className="mt-2 h-10 w-10 rounded-full" src={c.userImage} alt={c.userName} />
                ) : (
                  <div className="mt-2 h-10 w-10 rounded-full bg-gray-700" />
                )}
              </div>
              <div className="relative flex-1 rounded-lg border border-gray-300 px-4 py-2 leading-relaxed dark:border-gray-600">
                <strong className="text-gray-700 dark:text-gray-200">{c.userName}</strong>{" "}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {c.createdAt?.toDate?.() ? c.createdAt.toDate().toLocaleString() : ""}
                </span>
                {c.uid === auth.currentUser?.uid && (
                  <button className="absolute right-3 top-3 text-red-500" onClick={() => onDelete(c.id, c.uid)}>
                    Delete
                  </button>
                )}
                <p className="mt-1 text-sm text-gray-300">{c.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
