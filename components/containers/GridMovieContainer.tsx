"use client";
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
			path: apiPath,
			params: {
				page: page,
			},
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
					loader={
						<h3 className="text-center w-screen p-3 bg-grey">
							Loading more...
						</h3>
					}
					className="w-full md:w-11/12 m-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 items-start justify-start px-2 md:px-0"
				>
					{data.map((item, index) => (
						<div
							className="flex flex-col rounded-md p-2 shadow-sm hover:shadow-lg"
							key={index}
						>
							<MovieCard
								imgSrc={`${item.poster_path}`}
								title={`${item.title}`}
								movieId={item.id}
								showType={showType}
							/>
							<div className="flex flex-col gap-1 justify-between items-baseline">
								<p className="text">{item.title || item?.name}</p>
								<div className="flex gap-2 justify-end">
									<p className="text-orange-500 text-sm">
										{item?.vote_average?.toFixed(1)}/10
									</p>
									<p className="text-gray-400 text-sm">
										{item?.release_date?.split("-")[0]}
									</p>
								</div>
							</div>
						</div>
					))}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default GridMovieContainer;
