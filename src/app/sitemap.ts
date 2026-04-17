import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://power-app.local'

  // Static routes only for first deploy
  const blogRoutes: any[] = []
  const propertyRoutes: any[] = []

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
