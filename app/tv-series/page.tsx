import React from "react";
import { Metadata } from "next";

import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import getTrendingSeries from "@/dataFetchings/trendingSeries";

export const metadata: Metadata = {
	title: "TV Series",
	description: "Browse trending TV series.",
};

const TVSeriesPage = async () => {
	const dataRes = await getTrendingSeries(1);
	const data = dataRes?.data || null;
	const totalPages = dataRes?.totalPages || null;

	return (
		<>
			<PageTitle title="TRENDING TV SERIES" />
			<GridMovieContainer
				upcoming={data}
				title="Trending TV Series"
				apiPath={"/trending/tv/day"}
				total={totalPages}
				showType="tv"
			/>
		</>
	);
};

export default TVSeriesPage;
