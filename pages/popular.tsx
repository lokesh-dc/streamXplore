import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import { movieDetails } from "@/constants/typescript";
import getPopularMovies from "@/dataFetchings/popularMovies";
import React, { ReactElement } from "react";

interface props {
	data: Array<movieDetails> | null;
	totalPages: number | null;
}
const PopularMovies: React.FC<props> = ({ data, totalPages }): ReactElement => {
	return (
		<>
			<PageTitle title="Popular Movies" />
			<GridMovieContainer
				upcoming={data}
				title="Popular Movies"
				apiPath={"/movie/popular"}
				total={totalPages}
				showType="movie"
			/>
		</>
	);
};

export default PopularMovies;

export async function getServerSideProps() {
	// @ts-ignore
	const { data, totalPages } = await getPopularMovies(1);
	return {
		props: {
			data: data || null,
			totalPages: totalPages || null,
		},
	};
}
