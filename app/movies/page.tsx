import React from "react";
import { Metadata } from "next";

import discoverMovies from "@/dataFetchings/discoverMovies";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import PageTitle from "@/components/ui/PageTitle";
import GridMovieContainer from "@/components/containers/GridMovieContainer";

interface PageProps {
	searchParams: Promise<{
		genre?: string;
	}>;
}

export const metadata: Metadata = {
	title: "Discover Movies",
	description: "Browse movies by genre and more.",
};

const DiscoverMoviesPage = async ({ searchParams }: PageProps) => {
	const { genre } = await searchParams;
	const data = await discoverMovies({ page: 1, genre });
	const genresList = await getMoviesGenres();

	return (
		<>
			<PageTitle title="Discover Movies" />
			{/* <div className="px-2 md:px-9 flex justify-start gap-10">
				<SelectTag list={genresList?.genres} />
				<SelectTag list={[]} />
			</div> */}
			<GridMovieContainer
				upcoming={data?.results || []}
				title="Popular Movies"
				apiPath={"/discover/movie"}
				total={data?.total_pages || 1}
				showType="movie"
			/>
		</>
	);
};

export default DiscoverMoviesPage;
