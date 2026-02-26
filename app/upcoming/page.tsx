import React from "react";
import { Metadata } from "next";

import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import getUpcomingMovies from "@/dataFetchings/upcomingMovies";

export const metadata: Metadata = {
	title: "Upcoming Movies",
	description: "Browse upcoming movies.",
};

const UpcomingMoviesPage = async () => {
	const dataRes = await getUpcomingMovies();
	const upcoming = dataRes?.data || null;
	const totalPages = dataRes?.totalPages || null;

	return (
		<>
			<PageTitle title="UPCOMING MOVIES" />
			<GridMovieContainer
				upcoming={upcoming}
				title="Upcoming Movies"
				apiPath={"/movie/upcoming"}
				total={totalPages}
				showType="movie"
			/>
		</>
	);
};

export default UpcomingMoviesPage;
