import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

/**
 * Firestore rules only let the public read posts that are published or whose
 * scheduled time has passed, so every public query must carry one of those
 * filters (rules can't filter results, they reject the whole query).
 */

// a little in the past so a fast client clock can't make the query exceed request.time
const scheduledCutoff = () => Timestamp.fromMillis(Date.now() - 2 * 60 * 1000);

export type PostDoc = QueryDocumentSnapshot<DocumentData>;

/** All publicly visible posts (published + scheduled-and-due), de-duplicated. */
export async function fetchPublicPostDocs(): Promise<PostDoc[]> {
  const postsRef = collection(db, "posts");
  const [published, scheduled] = await Promise.all([
    getDocs(query(postsRef, where("isPublished", "==", true))),
    getDocs(query(postsRef, where("scheduledAt", "<=", scheduledCutoff()))).catch((err) => {
      console.warn("Could not load scheduled posts:", err?.code || err);
      return null;
    }),
  ]);

  const byId = new Map<string, PostDoc>();
  published.docs.forEach((d) => byId.set(d.id, d));
  scheduled?.docs.forEach((d) => byId.set(d.id, d));
  return Array.from(byId.values());
}

/**
 * Find one post by slug. Tries published, then scheduled-and-due, then a plain
 * slug lookup (only succeeds for the admin, so drafts can be previewed).
 */
export async function fetchPostBySlug(slug: string): Promise<PostDoc | null> {
  const postsRef = collection(db, "posts");

  const published = await getDocs(
    query(postsRef, where("slug", "==", slug), where("isPublished", "==", true))
  );
  if (!published.empty) return published.docs[0];

  try {
    // single-field range filter → no composite index needed; match slug locally
    const scheduled = await getDocs(query(postsRef, where("scheduledAt", "<=", scheduledCutoff())));
    const hit = scheduled.docs.find((d) => d.data().slug === slug);
    if (hit) return hit;
  } catch (err) {
    /* no scheduled posts readable */
  }

  try {
    const any = await getDocs(query(postsRef, where("slug", "==", slug)));
    if (!any.empty) return any.docs[0];
  } catch (err) {
    /* permission denied for non-admins: the post is a draft or doesn't exist */
  }
  return null;
}
