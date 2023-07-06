import GridMovieContainer from "@/components/containers/GridMovieContainer";
import { movieDetails } from "@/constants/typescript";
import getTrendingSeries from "@/data/trendingSeries";
import React, { ReactElement } from "react";

interface props {
	data: Array<movieDetails> | null;
	totalPages: number | null;
}
const TvSeries: React.FC<props> = ({ data, totalPages }): ReactElement => {
	return (
		<>
			<div>
				<h1 className="my-0 md:mt-12 p-5 text-5xl">TRENDING TV SERIES</h1>
			</div>
			<GridMovieContainer
				upcoming={data}
				title="Popular Movies"
				apiPath={"/trending/tv/day"}
				total={totalPages}
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
