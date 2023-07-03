import GridMovieContainer from "@/components/containers/GridMovieContainer";
import { movieDetails } from "@/constants/typescript";
import getUpcomingMovies from "@/data/upcomingMovies";
interface props {
	upcoming: Array<movieDetails> | null;
}

const UpcomingMoviesPage = ({ upcoming }: props) => {
	return (
		<>
			<div style={{ marginTop: "100px" }}>
				<h1 className="p-5 text-5xl">UPCOMING MOVIES</h1>
			</div>
			<GridMovieContainer data={upcoming} title="Popular Movies" />
		</>
	);
};

export default UpcomingMoviesPage;

export async function getServerSideProps() {
	const upcomingMovies = await getUpcomingMovies();
	return {
		props: {
			upcoming: upcomingMovies.results || null,
		},
	};
}
