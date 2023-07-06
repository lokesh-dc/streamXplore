import InfiniteScroll from "react-infinite-scroll-component";

import { movieDetails } from "@/constants/typescript";
import MovieCard from "../cards/MovieCard";
import React, { ReactElement, useState } from "react";
import getMethod from "@/utils/methods/get";

interface props {
	upcoming: Array<movieDetails> | null;
	title?: string;
	apiPath: string;
	total: number | null;
}

const GridMovieContainer: React.FC<props> = ({
	upcoming,
	apiPath,
	total,
}): ReactElement => {
	const [data, setData] = useState(upcoming || []);
	const [page, setPage] = useState(2);
	const [totalPages, setTotalPages] = useState(total);

	const getMoreUpcomingMovies = async () => {
		const { data, totalPages } = await getMethod({
			path: `${apiPath}?language=en-US&page=${page}`,
			params: "",
		});
		setData((prev): Array<movieDetails> => [...prev, ...data]);
		setPage((page) => page + 1);
		setTotalPages(totalPages);
	};

	return (
		<>
			<div className="my-3">
				<InfiniteScroll
					dataLength={data.length}
					next={getMoreUpcomingMovies}
					// @ts-ignore
					hasMore={totalPages >= page || !data}
					loader={<h3> Loading...</h3>}
					className="w-100 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-8 items-center justify-center"
				>
					{data.map((item, index) => (
						<div className="flex items-center justify-center">
							<MovieCard
								key={index}
								imgSrc={`${item.poster_path}`}
								title={`${item.title}`}
							/>
						</div>
					))}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default GridMovieContainer;
