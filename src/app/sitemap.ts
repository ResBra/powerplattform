import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://power-app.local'

  // Fetch dynamic routes
  const [posts, properties] = await Promise.all([
    prisma.blogPost.findMany({ where: { published: true }, select: { id: true, updatedAt: true } }),
    prisma.propertyListing.findMany({ select: { id: true, updatedAt: true } }),
  ])

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.updatedAt,
  }))

  const propertyRoutes = properties.map((prop) => ({
    url: `${baseUrl}/immobilien/${prop.id}`,
    lastModified: prop.updatedAt,
  }))

  const staticRoutes = [
    '',
    '/immobilien',
    '/blog',
    '/hausverwaltung',
    '/immobilienvermittlung',
    '/objektservice',
    '/impressum',
    '/datenschutz',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))

  return [...staticRoutes, ...blogRoutes, ...propertyRoutes]
}
