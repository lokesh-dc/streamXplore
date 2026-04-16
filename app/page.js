import getPopularMovies from "@/dataFetchings/popularMovies";
import getMoviesPlayingInThetres from "@/dataFetchings/nowPlayingIntheatres";

import HeroSection from "@/components/HeroSection";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import { normalizeMovie } from "@/utils/genres";

import trendingMovies from "@/dataFetchings/trendingMovies";
import trendingSeries from "@/dataFetchings/trendingSeries";
import MovieContainer from "@/components/containers/SwiperMovieContainer";
import MotionPage from "@/components/layout/MotionPage";

export const metadata = {
	title: "MovieSearch - Your Ultimate Movie & TV Guide",
	description: "Discover trending movies and TV series, search for your favorites, and get recommendations.",
};

export default async function HomePage() {
	const pageData = await getPageDetails();
	const { popular = {}, nowPlaying = {}, trending, trendingTV } = pageData;

	return (
		<MotionPage className="flex flex-col gap-4">
			<HeroSection data={nowPlaying?.data} />

			<MovieContainer
				data={popular?.data}
				title="Popular this week"
				showType="movie"
			/>

			<MovieContainer
				data={nowPlaying?.data}
				title="Now Playing in Thatres"
				showType="movie"
			/>
			<MovieContainer
				data={trending?.data}
				title="Trending Movies"
				showType="movie"
			/>
			<MovieContainer
				data={trendingTV?.data}
				title="Trending TV Series"
				showType="tv"
			/>
		</MotionPage>
	);
}

export async function getPageDetails() {
	const [popular, nowPlaying, movieGenres, trending, trendingTV] =
		await Promise.all([
			getPopularMovies(1),
			getMoviesPlayingInThetres(1),
			getMoviesGenres(),
			trendingMovies(),
			trendingSeries(),
			trendingSeries(), // Note: trendingTV was missing in original logic, assuming trendingSeries is meant for TV? 
			                  // Actually trendingSeries was imported but trendingTV was used.
		]);

	return {
		popular: {
			...popular,
			data: normalizeMovie(popular?.data, movieGenres?.data),
		},
		nowPlaying: {
			...nowPlaying,
			data: normalizeMovie(nowPlaying?.data, movieGenres?.data),
		},
		trending: {
			...trending,
			data: normalizeMovie(trending?.data, movieGenres?.data),
		},
		trendingTV: trendingTV || null,
	};
}
