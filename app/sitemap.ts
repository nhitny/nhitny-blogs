import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/Lib/Data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getAllBlogPosts()
    const baseUrl = 'https://nhitny-blogs.vercel.app'

    const blogUrls = posts.map((post) => ({
        url: `${baseUrl}/blogs/${post.id}`,
        lastModified: new Date(post.createdAt?.seconds * 1000 || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/interview`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...blogUrls,
    ]
}
