import React from "react";
import { Metadata } from "next";

import discoverMovies from "@/dataFetchings/discoverMovies";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import PageTitle from "@/components/ui/PageTitle";
import GridMovieContainer from "@/components/containers/GridMovieContainer";
import FilterBar from "@/components/ui/FilterBar";

interface PageProps {
	searchParams: Promise<{
		genre?: string;
		year?: string;
		sort?: string;
	}>;
}

export const metadata: Metadata = {
	title: "Discover Movies",
	description: "Browse movies by genre, era and more.",
};

const DiscoverMoviesPage = async ({ searchParams }: PageProps) => {
	const { genre, year, sort } = await searchParams;
	const data = await discoverMovies({
		page: 1,
		genre: genre || undefined,
		sort_by: sort || undefined,
		year_gte: year || null,
	});
	const genresList = await getMoviesGenres();

	const filterKey = `${genre || ""}-${year || ""}-${sort || ""}`;

	return (
		<>
			<PageTitle title="Discover Movies" />
			<FilterBar
				mediaType="movie"
				genres={genresList?.data || []}
				initialGenre={genre}
				initialYear={year}
				initialSort={sort}
			/>
			<GridMovieContainer
				key={filterKey}
				upcoming={data?.data || []}
				title="Popular Movies"
				apiPath={"/discover/movie"}
				total={data?.totalPages || 1}
				showType="movie"
				filters={{ genre, sort, yearGte: year || null }}
			/>
		</>
	);
};

export default DiscoverMoviesPage;