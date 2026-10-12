import React from "react";
import { Metadata } from "next";

import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import getPopularMovies from "@/dataFetchings/popularMovies";

export const metadata: Metadata = {
	title: "Popular Movies",
	description: "Browse popular movies.",
};

const PopularMoviesPage = async () => {
	const dataRes = await getPopularMovies(1);
	const data = dataRes?.data || null;
	const totalPages = dataRes?.totalPages || null;

	return (
		<>
			<PageTitle
				title="Popular Movies"
				eyebrow="Most watched"
				description="The titles audiences can't stop watching right now."
			/>
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

export default PopularMoviesPage;
