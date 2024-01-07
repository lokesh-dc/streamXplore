import GridMovieContainer from "@/components/containers/GridMovieContainer";
import PageTitle from "@/components/ui/PageTitle";
import { movieDetails } from "@/constants/typescript";
import getTrendingSeries from "@/dataFetchings/trendingSeries";
import React, { ReactElement } from "react";

interface props {
	data: Array<movieDetails> | null;
	totalPages: number | null;
}
const TvSeries: React.FC<props> = ({ data, totalPages }): ReactElement => {
	return (
		<>
			<PageTitle title="TRENDING TV SERIES" />
			<GridMovieContainer
				upcoming={data}
				title="Popular Movies"
				apiPath={"/trending/tv/day"}
				total={totalPages}
				showType="tv"
			/>
		</>
	);
};

export default TvSeries;

export async function getServerSideProps() {
	const { data, totalPages } = await getTrendingSeries(1);
	return {
		props: {
			data: data || null,
			totalPages: totalPages || null,
		},
	};
}
