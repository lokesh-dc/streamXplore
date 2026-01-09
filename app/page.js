import getPopularMovies from "@/dataFetchings/popularMovies";

import NavigationBar from "@/components/layout/navigation";
import HeroSection from "@/components/HeroSection";

export default async function HomePage() {
	const pageData = await getPageDetails();
	return (
		<>
			<NavigationBar />
			<HeroSection data={pageData?.popular?.data} />
		</>
	);
}

export async function getPageDetails() {
	const [popular, nowPlaying, trending, trendingTV] = await Promise.all([
		getPopularMovies(),
		// getMoviesPlayingInThetres(),
		// trendingMovies(),
		// trendingSeries(),
	]);

	return {
		popular: popular || null,
		// nowPlaying: nowPlaying || null,
		// trending: trending || null,
		// trendingTV: trendingTV || null,
	};
}
