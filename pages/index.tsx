import HeroSection from "@/components/HeroSection";
import { movieDetails } from "@/constants/typescript";
import getPopularMovies from "@/dataFetchings/popularMovies";
import getMoviesPlayingInThetres from "@/dataFetchings/nowPlayingIntheatres";
import trendingMovies from "@/dataFetchings/trendingMovies";
import trendingSeries from "@/dataFetchings/trendingSeries";

import dynamic from "next/dynamic";
import Head from "next/head";
const MovieContainer = dynamic(
	() => import("@/components/containers/SwiperMovieContainer")
);

interface props {
	trending: moviDetailsWithPage | null;
	popular: moviDetailsWithPage | null;
	nowPlaying: moviDetailsWithPage | null;
	trendingTV: moviDetailsWithPage | null;
}

interface moviDetailsWithPage {
	data: Array<movieDetails> | null;
	totalPages: number;
}

const HomePage = ({ trending, trendingTV, popular, nowPlaying }: props) => {
	return (
		<>
			<Head>
				<title>Home - OnScreen</title>
			</Head>
			<HeroSection data={trending?.data} />
			<MovieContainer
				data={popular?.data}
				title="Popular Movies"
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
		</>
	);
};

export default HomePage;

export async function getServerSideProps() {
	// const popular = await getPopularMovies();
	// const nowPlaying = await getMoviesPlayingInThetres();
	// const trending = await trendingMovies();
	// const trendingTV = await trendingSeries();

	const [popular, nowPlaying, trending, trendingTV] = await Promise.all([
		getPopularMovies(),
		getMoviesPlayingInThetres(),
		trendingMovies(),
		trendingSeries(),
	]);

	return {
		props: {
			popular: popular || null,
			nowPlaying: nowPlaying || null,
			trending: trending || null,
			trendingTV: trendingTV || null,
		},
	};
}
