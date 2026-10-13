"use client";

import { movieDetails } from "@/constants/typescript";
import React, { ReactElement } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

import styles from "@/styles/MovieContainer.module.css";
import MovieCard from "../cards/MovieCard";
import SectionHeader from "../ui/SectionHeader";

interface props {
	data: Array<movieDetails> | null | undefined;
	title?: string;
	showType: string;
	index?: number;
	subtitle?: string;
	href?: string;
}

const MovieContainer: React.FC<props> = ({
	data,
	title,
	showType,
	index,
	subtitle,
	href,
}): ReactElement => {
	if (!data || !data?.length) return <></>;

	const isTV = showType === "tv";
	const allHref = href ?? (isTV ? "/tv-series" : "/movies");

	return (
		<section className={`shell ${styles.row}`}>
			{title ? (
				<SectionHeader
					index={index}
					eyebrow={isTV ? "Series" : "Films"}
					title={title}
					subtitle={subtitle}
					href={allHref}
					linkLabel={`All ${isTV ? "series" : "movies"}`}
				/>
			) : null}

			<div className={styles.rowMaskWrap}>
				<Swiper
					slidesPerView="auto"
					spaceBetween={18}
					freeMode={true}
					mousewheel={{
						forceToAxis: true,
						releaseOnEdges: true,
					}}
					modules={[Mousewheel, FreeMode]}
					className={`w-full ${styles.swiperContainer} overscroll-x-contain touch-pan-y`}>
					{data?.map((item, i) => (
						<SwiperSlide key={`${item.id ?? i}-${i}`} className="!w-fit">
							<MovieCard
								imgSrc={item.poster_path}
								title={`${item?.title || item?.name}`}
								movieId={item.id}
								type={"scroll_card"}
								showType={showType}
								overlay
								mediaType={showType}
								rating={item?.vote_average}
								year={
									(item?.release_date || item?.first_air_date)?.split("-")[0] ?? null
								}
							/>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};

export default MovieContainer;
