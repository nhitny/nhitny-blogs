import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export async function getAllBlogPosts() {
  const snapshot = await getDocs(collection(db, "posts"));
  const blogs = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate().toISOString() : null,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    };
  });
  return blogs;
}

export async function getAllTopics() {
  const snapshot = await getDocs(collection(db, "topics"));
  const topics = snapshot.docs.map(doc => doc.data());
  return topics;
}
