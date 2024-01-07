import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import { movieDetails } from "@/constants/typescript";
import getUpcomingMovies from "@/dataFetchings/upcomingMovies";
interface props {
	upcoming: Array<movieDetails> | null;
	totalPages: number | null;
}

const UpcomingMoviesPage = ({ upcoming, totalPages }: props) => {
	return (
		<>
			<PageTitle title="UPCOMING MOVIES" />
			<GridMovieContainer
				upcoming={upcoming}
				title="Popular Movies"
				apiPath={"/movie/upcoming"}
				total={totalPages}
				showType="movie"
			/>
		</>
	);
};

export default UpcomingMoviesPage;

export async function getServerSideProps() {
	const { data, totalPages } = await getUpcomingMovies();
	return {
		props: {
			upcoming: data || null,
			totalPages: totalPages || null,
		},
	};
}
