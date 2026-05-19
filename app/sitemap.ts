import type { MetadataRoute } from 'next'

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://voca-ai-rust.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${siteUrl}/en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/vi`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
