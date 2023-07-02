import HeroSection from "@/components/HeroSection";
import MovieContainer from "@/components/containers/MovieContainer";
import { movieDetails } from "@/constants/typescript";
import getPopularMovies from "@/data/popularMovies";
import getMoviesPlayingInThetres from "@/data/nowPlayingIntheatres";
import trendingMovies from "@/data/trendingMovies";
import trendingSeries from "@/data/trendingSeries";
interface props {
	trending: Array<movieDetails> | null;
	popular: Array<movieDetails> | null;
	nowPlaying: Array<movieDetails> | null;
	trendingTV: Array<movieDetails> | null;
}

const HomePage = ({ trending, trendingTV, popular, nowPlaying }: props) => {
	return (
		<>
			<HeroSection data={trending} />
			<MovieContainer data={popular} title="Popular Movies" />
			<MovieContainer data={nowPlaying} title="Now Playing in Thatres" />
			<MovieContainer data={trending} title="Trending Movies" />
			<MovieContainer data={trendingTV} title="Trending TV Series" />
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
