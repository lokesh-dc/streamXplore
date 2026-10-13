"use client";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";

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

const GRID =
	"grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5";

const GridSkeleton = () => (
	<div className={`${GRID} col-span-full`}>
		{Array.from({ length: 10 }).map((_, i) => (
			<div key={i} className="animate-pulse">
				<div className="aspect-[2/3] w-full rounded-xl bg-white/[0.05]" />
				<div className="mt-3 h-3 w-4/5 rounded-full bg-white/[0.05]" />
				<div className="mt-2 h-3 w-1/3 rounded-full bg-white/[0.05]" />
			</div>
		))}
	</div>
);

const EmptyState = ({
	hasFilters,
	basePath,
}: {
	hasFilters: boolean;
	basePath: string;
}) => (
	<div className="flex flex-col items-center gap-4 py-24 text-center">
		<span className="eyebrow">No results</span>
		<h2 className="font-display text-4xl leading-none md:text-5xl">
			Nothing matched those filters
		</h2>
		<p className="max-w-sm text-sm leading-relaxed text-text-secondary">
			Try another genre, era or sort order — or clear the filters to see
			everything.
		</p>
		{hasFilters && (
			<Link
				href={basePath}
				className="mt-2 inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
				Clear filters
			</Link>
		)}
	</div>
);

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
	const hasFilters = Boolean(filters?.genre || filters?.sort || filters?.yearGte);
	const basePath = showType === "tv" ? "/tv-series" : "/movies";

	if (!visibleData.length) {
		return (
			<section className="shell pb-24 pt-10">
				<EmptyState hasFilters={hasFilters} basePath={basePath} />
			</section>
		);
	}

	return (
		<section className="shell pb-24 pt-10">
			<InfiniteScroll
				dataLength={visibleData.length}
				next={getMoreUpcomingMovies}
				// @ts-ignore
				hasMore={!!data && totalPages >= page}
				loader={<GridSkeleton />}
				className={GRID}>
				{visibleData.map((item, index) => {
					const released = isReleased(item);
					const year = (item?.release_date || item?.first_air_date)?.split(
						"-",
					)[0];
					return (
						<article
							key={`${item.id}-${index}`}
							className="group flex flex-col">
							<MovieCard
								imgSrc={`${item.poster_path}`}
								title={`${item.title || item.name}`}
								movieId={item.id}
								showType={showType}
								rating={released ? item.vote_average : null}
							/>
							<div className="mt-3 flex flex-col gap-1">
								<h3 className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">
									{item.title || item.name}
								</h3>
								<div className="flex items-center gap-2 text-xs text-text-secondary">
									{year ? <span className="tabular">{year}</span> : null}
									{!released ? (
										<span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ff8a5c]">
											Coming soon
										</span>
									) : null}
								</div>
							</div>
						</article>
					);
				})}
			</InfiniteScroll>
		</section>
	);
};

export default GridMovieContainer;
