import { movieDetails } from "@/constants/typescript";
import MovieCard from "../cards/MovieCard";
import React, { ReactElement, useState } from "react";
import getMethod from "@/utils/methods/get";

import GetMoreButton from "@/components/buttons/GetMore";

interface props {
	upcoming: Array<movieDetails> | null;
	title?: string;
}

const GridMovieContainer: React.FC<props> = ({ upcoming }): ReactElement => {
	const [data, setData] = useState(upcoming || []);
	const [page, setPage] = useState(2);
	const [totalPages, setTotalPages] = useState(10);

	const getMoreUpcomingMovies = async () => {
		const { data, totalPages } = await getMethod({
			path: `/movie/upcoming?language=en-US&page=${page}`,
			params: "",
		});
		setData((prev): Array<movieDetails> => [...prev, ...data]);
		setPage((page) => page + 1);
		setTotalPages(totalPages);
	};
	return (
		<>
			<div className="my-3 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-8 justify-center	">
				{data?.map((item: movieDetails, index: number) => (
					<div className="flex justify-center" key={index}>
						<MovieCard imgSrc={`${item.poster_path}`} title={`${item.title}`} />
					</div>
				))}
			</div>
			{totalPages !== page ? (
				<GetMoreButton clickevent={getMoreUpcomingMovies} />
			) : (
				<div className="h-1 py-2"></div>
			)}
		</>
	);
};

export default GridMovieContainer;
