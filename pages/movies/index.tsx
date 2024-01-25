import discoverMovies from "@/dataFetchings/discoverMovies";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import PageTitle from "@/components/ui/PageTitle";
import { movieDetails } from "@/constants/typescript";
import React, { ReactElement } from "react";
import GridMovieContainer from "@/components/containers/GridMovieContainer";

interface props {
	data: Array<movieDetails> | null;
	totalPages: number | null;
	genresList: Array<any>;
}

const DiscoverMoviesPage: React.FC<props> = ({
	data,
	totalPages,
	// genresList,
}): ReactElement => {
	return (
		<>
			<PageTitle title="Discover Movies" />
			{/* <div className="px-2 md:px-9 flex justify-start gap-10">
				<SelectTag list={genresList} />
				<SelectTag list={[]} />
			</div> */}
			<GridMovieContainer
				upcoming={data}
				title="Popular Movies"
				apiPath={"/discover/movie"}
				total={totalPages}
				showType="movie"
			/>
		</>
	);
};

export default DiscoverMoviesPage;

export async function getServerSideProps(context: { query: any }) {
	const { genre } = context?.query;
	const data = await discoverMovies({ page: 1, genre });
	const genresList = await getMoviesGenres();
	return {
		props: {
			data: data?.results,
			genresList: genresList?.genres,
			totalPages: data?.total_pages,
		},
	};
}
