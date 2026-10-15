import { MetadataRoute } from 'next'

// Sitemap intentionally disabled: site is set to noindex to protect
// Vercel free-tier usage. Returning an empty list stops search engines
// from discovering URLs and avoids TMDB API calls at build time.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return []
}
