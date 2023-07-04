import GridMovieContainer from "@/components/containers/GridMovieContainer";
import { movieDetails } from "@/constants/typescript";
import getUpcomingMovies from "@/data/upcomingMovies";

import GetMoreButton from "@/components/buttons/GetMore";
import { useState } from "react";
import getMethod from "@/utils/methods/get";
interface props {
	upcoming: Array<movieDetails> | null;
}

const UpcomingMoviesPage = ({ upcoming }: props) => {
	const [data, setData] = useState(upcoming || []);
	const [page, setPage] = useState(2);
	const [totalPages, setTotalPages] = useState(10);

	const getMoreUpcomingMovies = async () => {
		const { data, totalPages } = await getMethod({
			path: `/movie/upcoming?language=en-US&page=${page}`,
			params: "",
		});
		setData((prev): Array<movieDetails> => [...prev, ...data]);
		setPage((page) => page + 1);
		setTotalPages(totalPages);
	};
	return (
		<>
			<div>
				<h1 className="my-0 md:mt-12 p-5 text-5xl">UPCOMING MOVIES</h1>
			</div>
			<GridMovieContainer data={data} title="Popular Movies" />
			{totalPages !== page ? (
				<GetMoreButton clickevent={getMoreUpcomingMovies} />
			) : (
				<div className="h-1 py-2"></div>
			)}
		</>
	);
};

export default UpcomingMoviesPage;

export async function getServerSideProps() {
	const { data } = await getUpcomingMovies();
	return {
		props: {
			upcoming: data || null,
		},
	};
}
