"use client";

import { getImageBaseLink } from "@/constants";
import SeasonsModal from "@/modals/SeasonsModal";
import Image from "next/image";
import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

interface SeasonsContainerProps {
	data: Array<any>;
	seriesId: string;
}

const SeasonsContainer: React.FC<SeasonsContainerProps> = ({ data, seriesId }) => {
	const [activeSeason, setActiveSeason] = useState<number | null>(null);

	if (!data || data.length === 0) return null;

	// Filter out specials and handle the display logic
	const filteredSeasons = data.filter(item => item.name !== "Specials");

	return (
		<div className="mt-4 mb-4 w-full">
			<div className="relative group overflow-hidden">
				<Swiper
					slidesPerView="auto"
					spaceBetween={16}
					freeMode={true}
					mousewheel={{
						forceToAxis: true,
						releaseOnEdges: true,
					}}
					modules={[Mousewheel, FreeMode]}
					className="w-full !overflow-x-clip !overflow-y-visible overscroll-x-contain touch-pan-y"
				>
					{filteredSeasons.map((item, index) => (
						<SwiperSlide key={index} className="!w-fit pb-8 px-1">
							<motion.div
								whileHover={{ y: -5 }}
								whileTap={{ scale: 0.98 }}
								className="flex-none w-[140px] md:w-[160px] cursor-pointer"
								onClick={() => setActiveSeason(item.season_number)}
							>
								<div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 group/card shadow-lg hover:shadow-primary/10 transition-all">
									<Image
										unoptimized
										src={getImageBaseLink({
											path: item.poster_path,
											type: "poster",
											quality: "lg",
										})}
										fill
										alt={item.name}
										className="object-cover transition-transform duration-500 group-hover/card:scale-110"
									/>
									
									{/* Overlay for episode count */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
										<div className="flex items-center gap-1 text-primary font-bold text-xs mb-1">
											<AiFillStar />
											<span>{item.vote_average || "N/A"}</span>
										</div>
										<p className="text-[10px] text-gray-300 uppercase tracking-wider font-bold">
											{item.episode_count} Episodes
										</p>
									</div>
								</div>
								
								<div className="mt-3">
									<h3 className="text-sm font-bold text-gray-100 group-hover:text-primary transition-colors truncate">
										{item.name}
									</h3>
									<p className="text-xs text-gray-500 mt-0.5 font-medium">
										{item.air_date ? item.air_date.split("-")[0] : "Coming Soon"}
									</p>
								</div>
							</motion.div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>

			{activeSeason !== null && (
				<SeasonsModal
					activeSeason={activeSeason}
					totalSeasons={data.length}
					setActiveSeason={setActiveSeason}
					seriesId={seriesId}
				/>
			)}
		</div>
	);
};

export default SeasonsContainer;
