import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HookedOnMovies - Ultimate Movie & TV Guide',
    short_name: 'HookedOnMovies',
    description: 'Discover trending movies and TV series, search for your favorites, and get personalized recommendations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
