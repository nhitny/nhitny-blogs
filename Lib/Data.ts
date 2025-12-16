
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore";

// Fetch published and scheduled posts separately to comply with Firestore rules
export async function getAllBlogPosts() {
  const postsRef = collection(db, "posts");

  try {
    const now = new Date();
    const allPosts: any[] = [];

    // 1. Fetch explicitly published posts
    try {
      const qPublished = query(
        postsRef,
        where("isPublished", "==", true)
      );
      const snapPub = await getDocs(qPublished);
      console.log(`[DEBUG] Found ${snapPub.size} published posts`);

      snapPub.docs.forEach(d => {
        const data = d.data();
        allPosts.push({
          id: d.id,
          ...data,
          date: data?.date?.toDate ? data.date.toDate().toISOString() : data?.date ?? null,
          scheduledAt: data?.scheduledAt?.toDate ? data.scheduledAt.toDate().toISOString() : null,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt ?? null,
        });
      });
    } catch (err) {
      console.error("Error fetching published posts:", err);
    }

    // 2. Fetch ALL posts (to get scheduled ones)
    // Firestore rules allow reading posts with scheduledAt != null
    try {
      const qAll = query(postsRef);
      const snapAll = await getDocs(qAll);
      console.log(`[DEBUG] Found ${snapAll.size} total posts in collection`);

      snapAll.docs.forEach(d => {
        const data = d.data();

        // Skip if already added (published posts)
        if (allPosts.find(p => p.id === d.id)) {
          return;
        }

        // Check if has scheduledAt and time has passed
        if (data.scheduledAt) {
          const scheduledAt = data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date(data.scheduledAt);
          const isPassed = scheduledAt <= now;

          if (isPassed) {
            console.log(`[DEBUG] ✓ Including scheduled post: "${data.title || d.id}" at ${scheduledAt.toISOString()}`);
            allPosts.push({
              id: d.id,
              ...data,
              date: data?.date?.toDate ? data.date.toDate().toISOString() : data?.date ?? null,
              scheduledAt: scheduledAt.toISOString(),
              createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt ?? null,
            });
          } else {
            console.log(`[DEBUG] ✗ Skipping future scheduled post: "${data.title || d.id}"`);
          }
        }
      });
    } catch (err) {
      console.warn("Could not fetch all posts (may need admin access):", err);
    }

    // 3. Sort by date
    const results = allPosts.sort((a, b) => {
      const dateA = new Date(a.date || a.scheduledAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.scheduledAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    console.log(`[DEBUG] Returning ${results.length} total posts. Server Time: ${now.toISOString()}`);
    return results;

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
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


