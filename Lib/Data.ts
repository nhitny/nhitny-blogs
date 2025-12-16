import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export async function getAllBlogPosts() {
  const q = query(
    collection(db, "posts"),
    where("isPublished", "==", true),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data: any = d.data();
    return {
      id: d.id,
      ...data,
      date: data?.date?.toDate ? data.date.toDate().toISOString() : data?.date ?? null,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt ?? null,
    };
  });
}

export async function getAllTopics(): Promise<string[]> {
  const snap = await getDocs(collection(db, "topics"));
  const raw = snap.docs.map((d) => d.data());

  // cố gắng lấy tên topic từ các field phổ biến
  const names = raw
    .map((t: any) =>
      typeof t === "string"
        ? t
        : t?.name ?? t?.topic ?? t?.title ?? t?.slug ?? null
    )
    .filter(Boolean) as string[];

  // loại trùng
  return Array.from(new Set(names));
}


