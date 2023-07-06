import GridMovieContainer from "@/components/containers/GridMovieContainer";
import { movieDetails } from "@/constants/typescript";
import getPopularMovies from "@/data/popularMovies";
import React, { ReactElement } from "react";

interface props {
	data: Array<movieDetails> | null;
	totalPages: number | null;
}
const PopularMovies: React.FC<props> = ({ data, totalPages }): ReactElement => {
	return (
		<>
			<div>
				<h1 className="my-0 md:mt-12 p-5 text-5xl">POPULAR MOVIES</h1>
			</div>
			<GridMovieContainer
				upcoming={data}
				title="Popular Movies"
				apiPath={"/movie/popular"}
				total={totalPages}
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
