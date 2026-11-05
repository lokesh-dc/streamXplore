"use client";

import { getImageBaseLink } from "@/constants";
import SeasonsModal from "@/modals/SeasonsModal";
import Image from "next/image";
import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import HorizontalSlider from "@/components/ui/HorizontalSlider";

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
			<HorizontalSlider gap={16} itemClassName="pb-4 px-0.5" ariaLabel="Seasons">
				{filteredSeasons.map((item, index) => (
					<div
						key={item.id ?? index}
						className="group flex-none w-[140px] md:w-[160px] cursor-pointer select-none transition-transform duration-300 ease-smooth hover:-translate-y-1 active:scale-[0.98]"
						onClick={() => setActiveSeason(item.season_number)}
					>
						<div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 group/card shadow-lg hover:shadow-primary/10 transition-all">
							<Image
								unoptimized
								loading="lazy"
								decoding="async"
								draggable={false}
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
							<h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate">
								{item.name}
							</h3>
							<p className="text-xs text-text-secondary mt-0.5 font-medium">
								{item.air_date ? item.air_date.split("-")[0] : "Coming Soon"}
							</p>
						</div>
					</div>
				))}
			</HorizontalSlider>

			{activeSeason !== null && (
				<SeasonsModal
					activeSeason={activeSeason}
					totalSeasons={filteredSeasons.length}
					setActiveSeason={setActiveSeason}
					seriesId={seriesId}
				/>
			)}
		</div>
	);
};

export default SeasonsContainer;
