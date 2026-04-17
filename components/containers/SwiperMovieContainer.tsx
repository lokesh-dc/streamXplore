"use client";

import { movieDetails } from "@/constants/typescript";
import React, { ReactElement } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

import styles from "@/styles/MovieContainer.module.css";
import MovieCard from "../cards/MovieCard";

interface props {
	data: Array<movieDetails> | null | undefined;
	title?: string;
	showType: string;
}

const MovieContainer: React.FC<props> = ({
	data,
	title,
	showType,
}): ReactElement => {
	if (!data || !data?.length) return <></>;
	return (
		<div className="p-3 py-5 flex flex-col gap-1">
			{title ? (
				<h2 className={`text-4xl bebas_nueve ${styles.title}`}>{title}</h2>
			) : null}

			<Swiper
				slidesPerView="auto"
				spaceBetween={16}
				freeMode={true}
				mousewheel={{
					forceToAxis: true, // Allows vertical page scroll while mouse is over slider
					releaseOnEdges: true, // Releases wheel control at the start/end of slider
				}}
				modules={[Mousewheel, FreeMode]}
				className={`w-full ${styles.swiperContainer}`}>
				{data?.map((item, index) => (
					<SwiperSlide key={index} className="!w-fit">
						<MovieCard
							// @ts-ignore
							imgSrc={`${item.poster_path || item.file_path}`}
							title={`${item?.title || item?.name}`}
							movieId={item.id}
							type={"scroll_card"}
							showType={showType}
						/>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default MovieContainer;
