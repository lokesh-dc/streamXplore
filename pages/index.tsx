import HeroSection from "@/components/HeroSection";
import MovieContainer from "@/components/containers/MovieContainer";
import { movieDetails } from "@/constants/typescript";
import getPopularMovies from "@/data/popularMovies";
import getMoviesPlayingInThetres from "@/data/nowPlayingIntheatres";
interface props {
	popular: Array<movieDetails> | null;
	nowPlaying: Array<movieDetails> | null;
}

const HomePage = ({ popular, nowPlaying }: props) => {
	return (
		<>
			<HeroSection data={popular} />
			<MovieContainer data={popular} title="Popular Movies" />
			<MovieContainer data={nowPlaying} title="Now Playing in Thatres" />
		</>
	);
};

export default HomePage;

export async function getServerSideProps() {
	const popular = await getPopularMovies();
	const nowPlaying = await getMoviesPlayingInThetres();

	return {
		props: {
			popular,
			nowPlaying,
		},
	};
}
