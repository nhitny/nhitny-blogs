import Head from "next/head";
import Navbar from "@/components/Navbar";
import BlogHeader from "@/components/BlogHeader";

import { getAllBlogPosts, getAllTopics } from "@/Lib/Data";

export async function getServerSideProps() {
    const blogs = await getAllBlogPosts();
    const topics = await getAllTopics();
    return {
        props: {
            blogs,
            topics,
        },
    };
}

export default function Home({ blogs, topics }) {
    return (
        <>
            <Head>
                <title>Blogs 🚀</title>
            </Head>

            <Navbar topics={topics} />

            <main className="p-10 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Bài viết mới</h1>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map(
                        (blog) =>
                            blog.isPublished && (
                                <BlogHeader key={blog.id} data={blog} />
                            )
                    )}
                </div>
            </main>
        </>
    );
}
