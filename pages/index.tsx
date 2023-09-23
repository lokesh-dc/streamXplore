import HeroSection from "@/components/HeroSection";
import { movieDetails } from "@/constants/typescript";
import getPopularMovies from "@/data/popularMovies";
import getMoviesPlayingInThetres from "@/data/nowPlayingIntheatres";
import trendingMovies from "@/data/trendingMovies";
import trendingSeries from "@/data/trendingSeries";
// import MovieContainer from "@/components/containers/SwiperMovieContainer";

import dynamic from "next/dynamic";
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
	// console.log({ popular });
	return (
		<>
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
	const popular = await getPopularMovies();
	const nowPlaying = await getMoviesPlayingInThetres();
	const trending = await trendingMovies();
	const trendingTV = await trendingSeries();

	return {
		props: {
			popular: popular || null,
			nowPlaying: nowPlaying || null,
			trending: trending || null,
			trendingTV: trendingTV || null,
		},
	};
}
