import React, { ReactElement } from "react";
import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import SelectTag from "@/components/Interactive-components/SelectTag";
import getPopularMovies from "@/dataFetchings/popularMovies";

import { movieDetails } from "@/constants/typescript";

interface props {
	data: Array<movieDetails> | null;
	totalPages: number | null;
}
const PopularMovies: React.FC<props> = ({ data, totalPages }): ReactElement => {
	return (
		<>
			<div className="flex flex-col justify-between">
				<PageTitle title="Popular Movies" />
				{/* <SelectTag /> */}
			</div>
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
