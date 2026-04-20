"use client";

import { getImageBaseLink } from "@/constants";
import SeasonsModal from "@/modals/SeasonsModal";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { motion } from "framer-motion";

interface SeasonsContainerProps {
	data: Array<any>;
	seriesId: string;
}

const SeasonsContainer: React.FC<SeasonsContainerProps> = ({ data, seriesId }) => {
	const [activeSeason, setActiveSeason] = useState<number | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = scrollRef.current;
		if (el) {
			const onWheel = (e: WheelEvent) => {
				if (e.deltaY === 0) return;
				
				// Check if we can scroll further in the intended direction
				const isScrollingLeft = e.deltaY < 0;
				const canScrollLeft = el.scrollLeft > 0;
				const canScrollRight = el.scrollLeft < (el.scrollWidth - el.clientWidth);

				// If we can scroll horizontally, prevent the main page from scrolling vertically
				if ((isScrollingLeft && canScrollLeft) || (!isScrollingLeft && canScrollRight)) {
					e.preventDefault();
					el.scrollLeft += e.deltaY;
				}
			};
			
			el.addEventListener('wheel', onWheel, { passive: false });
			return () => el.removeEventListener('wheel', onWheel);
		}
	}, []);

	if (!data || data.length === 0) return null;

	// Filter out specials and handle the display logic
	const filteredSeasons = data.filter(item => item.name !== "Specials");

	return (
		<div className="mt-8 mb-4">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
					<span className="w-1.5 h-6 bg-primary rounded-full"></span>
					Seasons
				</h2>
			</div>

			<div className="relative group">
				{/* Horizontal Scroll Container - Removed snap-x to fix desktop 'stuck' feeling */}
				<div 
					ref={scrollRef}
					className="flex gap-4 overflow-x-auto overflow-y-hidden pb-6 overscroll-x-contain no-scrollbar scrollbar-hide"
				>
					{filteredSeasons.map((item, index) => (
						<motion.div
							key={index}
							whileHover={{ y: -5 }}
							whileTap={{ scale: 0.98 }}
							className="flex-none w-[160px] cursor-pointer"
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
					))}
				</div>
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
