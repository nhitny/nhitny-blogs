import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export async function getAllBlogPosts() {
  const q = query(
    collection(db, "posts"),
    where("isPublished", "==", true),
    orderBy("date", "desc") // nếu bạn có field 'date'
  );

  const snapshot = await getDocs(q);
  const blogs = snapshot.docs.map((doc) => {
    const data: any = doc.data();
    return {
      id: doc.id,
      ...data,
      // chuyển timestamp Firestore (nếu có) về string an toàn
      date: data?.date?.toDate ? data.date.toDate().toISOString() : data?.date ?? null,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt ?? null,
    };
  });

  return blogs;
}

export async function getAllTopics() {
  const snapshot = await getDocs(collection(db, "topics"));
  return snapshot.docs.map((doc) => doc.data());
}
