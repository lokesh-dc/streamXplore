"use client";

import React, { ReactElement } from "react";
import MovieImageCard from "@/components/cards/MovieImageCard";
import { movieImages } from "@/constants/typescript";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

interface props {
	data: movieImages[];
	title: string;
	stateChange: Function;
}

const MovieImages: React.FC<props> = ({
	data,
	title,
	stateChange,
}): ReactElement => {
	return (
		<div className="mt-8 mb-4">
			<h2 className="py-1 text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3 mb-6">
				<span className="w-1.5 h-6 bg-primary rounded-full"></span>
				Images
			</h2>
			<div className="relative group">
				<Swiper
					slidesPerView="auto"
					spaceBetween={16}
					freeMode={true}
					mousewheel={{
						forceToAxis: true,
						releaseOnEdges: true,
					}}
					modules={[Mousewheel, FreeMode]}
					className="w-full !overflow-visible overscroll-x-contain touch-pan-y"
				>
					{data.map(({ file_path }, index) => (
						<SwiperSlide key={index} className="!w-fit pb-4">
							<MovieImageCard
								position={index}
								imgSrc={file_path}
								key={index}
								title={title}
								// @ts-ignore
								stateChange={stateChange}
							/>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</div>
	);
};

export default MovieImages;
