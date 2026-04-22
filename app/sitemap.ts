import { MetadataRoute } from 'next'
import getPopularMovies from "@/dataFetchings/popularMovies";
import trendingSeries from "@/dataFetchings/trendingSeries";

const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookedonmovies-app.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base routes
  const routes = ['', '/movies', '/tv-series', '/popular', '/upcoming', '/recommendations'].map(
    (route) => ({
      url: `${EXTERNAL_DATA_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    })
  )

  try {
    // Fetch some popular items to include in sitemap
    const [popularMovies, trendingTV] = await Promise.all([
      getPopularMovies(1),
      trendingSeries()
    ]);

    const movieUrls = (popularMovies?.data?.results || []).slice(0, 20).map((movie: any) => ({
      url: `${EXTERNAL_DATA_URL}/movie/${encodeURIComponent(movie.title.replace(/ /g, '-').toLowerCase())}/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const tvUrls = (trendingTV?.data?.results || []).slice(0, 20).map((tv: any) => ({
      url: `${EXTERNAL_DATA_URL}/tv/${encodeURIComponent(tv.name.replace(/ /g, '-').toLowerCase())}/${tv.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...movieUrls, ...tvUrls];
  } catch (error) {
    return routes;
  }
}
