"use client";
import InfiniteScroll from "react-infinite-scroll-component";

import { movieDetails } from "@/constants/typescript";
import MovieCard from "../cards/MovieCard";
import React, { ReactElement, useState } from "react";
import getMethod from "@/utils/methods/get";
import { isReleased, newestDateLte } from "@/utils";

interface props {
	upcoming: Array<movieDetails> | null;
	title?: string;
	apiPath: string;
	total: number | null;
	showType: string;
	filters?: { genre?: string; sort?: string; yearGte?: string | null };
}

const GridMovieContainer: React.FC<props> = ({
	upcoming,
	apiPath,
	total,
	showType,
	filters,
}): ReactElement => {
	const [data, setData] = useState(upcoming || []);
	const [page, setPage] = useState(2);
	const [totalPages, setTotalPages] = useState(total);

	const getMoreUpcomingMovies = async () => {
		const isMovie = apiPath.includes("/movie");
		const params: any = {
			page,
			...newestDateLte(filters?.sort),
		};
		if (filters?.genre) params.with_genres = filters.genre;
		if (filters?.sort) params.sort_by = filters.sort;
		if (filters?.yearGte) {
			params[isMovie ? "primary_release_date.gte" : "first_air_date.gte"] =
				`${filters.yearGte}-01-01`;
		}
		const { data, totalPages } = await getMethod({
			path: apiPath,
			params,
		});
		setData((prev): Array<movieDetails> => [...prev, ...data]);
		setPage((page) => page + 1);
		setTotalPages(totalPages);
	};

	const isNewest =
		filters?.sort === "primary_release_date.desc" ||
		filters?.sort === "first_air_date.desc";

	const visibleData = isNewest ? data.filter(isReleased) : data;

	return (
		<>
			<div className="my-3">
				<InfiniteScroll
					dataLength={visibleData.length}
					next={getMoreUpcomingMovies}
					// @ts-ignore
					hasMore={!!data && totalPages >= page}
					loader={
						<h3 className="text-center w-screen p-3 bg-grey">
							Loading more...
						</h3>
					}
					className="w-full md:w-11/12 m-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 items-start justify-start px-2 md:px-0"
				>
					{visibleData.map((item, index) => (
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
<div className="flex gap-2 justify-end items-center">
								{isReleased(item) ? (
									<p className="text-orange-500 text-sm">
										{item?.vote_average?.toFixed(1)}/10
									</p>
								) : (
									<span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#E6501B]/20 text-[#ff8a5c] border border-[#E6501B]/30">
										Coming Soon
									</span>
								)}
								<p className="text-gray-400 text-sm">
									{(item?.release_date || item?.first_air_date)?.split("-")[0]}
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
