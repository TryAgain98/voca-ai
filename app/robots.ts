import type { MetadataRoute } from 'next'

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://voca-ai-rust.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/en', '/vi'],
      disallow: ['/en/admin/', '/vi/admin/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
