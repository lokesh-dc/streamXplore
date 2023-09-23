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
	showType: string;
}

const GridMovieContainer: React.FC<props> = ({
	upcoming,
	apiPath,
	total,
	showType,
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
					loader={<h3 className="text-center"> Loading...</h3>}
					className="w-full md:w-11/12 m-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 items-center justify-center px-2 md:px-0"
				>
					{data.map((item, index) => (
						<div className="flex items-center justify-center" key={index}>
							<MovieCard
								imgSrc={`${item.poster_path}`}
								title={`${item.title}`}
								movieId={item.id}
								showType={showType}
								type={"scroll_card"}
							/>
						</div>
					))}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default GridMovieContainer;
