import { movieDetails } from "@/constants/typescript";
import MovieCard from "../cards/MovieCard";
import React, { ReactElement } from "react";

interface props {
	data: Array<movieDetails> | null;
	title?: string;
}

const GridMovieContainer: React.FC<props> = ({ data }): ReactElement => {
	return (
		<div className="my-3 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-8 justify-center	">
			{data?.map((item: movieDetails, index: number) => (
				<div className="flex justify-center" key={index}>
					<MovieCard imgSrc={`${item.poster_path}`} title={`${item.title}`} />
				</div>
			))}
		</div>
	);
};

export default GridMovieContainer;
