import { fetchPublicPostDocs } from "@/Lib/postQueries";

const iso = (v: any) => (v?.toDate ? v.toDate().toISOString() : v ?? null);

// Published posts + scheduled posts whose time has passed, newest first.
export async function getAllBlogPosts() {
  try {
    const docs = await fetchPublicPostDocs();
    const now = Date.now();
    const posts = docs
      .map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          ...data,
          date: iso(data?.date),
          scheduledAt: iso(data?.scheduledAt),
          createdAt: iso(data?.createdAt),
          updatedAt: iso(data?.updatedAt),
          views: data?.views || 0,
          likes: data?.likes || 0,
          commentsCount: data?.commentsCount || 0,
          tags: data?.tags || [],
          author: data?.author || null,
        };
      })
      // safety net in case a scheduled post slipped through
      .filter((p: any) => p.isPublished || (p.scheduledAt && new Date(p.scheduledAt).getTime() <= now));

    return posts.sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.scheduledAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.scheduledAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getAllTopics(): Promise<string[]> {
  try {
    // Aggregating tags from all posts is more reliable for now
    const posts = await getAllBlogPosts();
    const tags = new Set<string>();

    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          if (tag && typeof tag === 'string') {
            tags.add(tag);
          }
        });
      }
    });

    return Array.from(tags).sort();
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
}


