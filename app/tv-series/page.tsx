import React from "react";
import { Metadata } from "next";

import discoverTV from "@/dataFetchings/discoverTV";
import getTVGenres from "@/dataFetchings/getTVGenres";
import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import FilterBar from "@/components/ui/FilterBar";

interface PageProps {
	searchParams: Promise<{
		genre?: string;
		year?: string;
		sort?: string;
	}>;
}

export const metadata: Metadata = {
	title: "TV Series",
	description: "Browse TV series by genre, era and more.",
};

const TVSeriesPage = async ({ searchParams }: PageProps) => {
	const { genre, year, sort } = await searchParams;
	const data = await discoverTV({
		page: 1,
		genre: genre || undefined,
		sort_by: sort || undefined,
		year_gte: year || null,
	});
	const genresList = await getTVGenres();

	const filterKey = `${genre || ""}-${year || ""}-${sort || ""}`;

	return (
		<>
			<PageTitle title="TRENDING TV SERIES" />
			<FilterBar
				mediaType="tv"
				genres={genresList?.data || []}
				initialGenre={genre}
				initialYear={year}
				initialSort={sort}
			/>
			<GridMovieContainer
				key={filterKey}
				upcoming={data?.data || []}
				title="TV Series"
				apiPath={"/discover/tv"}
				total={data?.totalPages || 1}
				showType="tv"
				filters={{ genre, sort, yearGte: year || null }}
			/>
		</>
	);
};

export default TVSeriesPage;