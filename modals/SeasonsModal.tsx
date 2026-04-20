"use client";
import React, { ReactElement, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { AiFillStar } from "react-icons/ai";
import getSeriesSeasonDetails from "@/dataFetchings/getSeriesSeasonDetails";
import Image from "next/image";
import { getImageBaseLink } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useBodyLock } from "@/hooks/useBodyLock";

interface props {
	activeSeason: number;
	totalSeasons: number;
	setActiveSeason: (season: number | null) => void;
	seriesId: string;
}

interface seasonDataProps {
	air_date: string;
	episodes: Array<any>;
	id: number;
	name: string;
	overview: string;
	poster_path: string;
	season_number: number;
	vote_average: number;
}

const SeasonsModal: React.FC<props> = ({
	activeSeason,
	totalSeasons,
	setActiveSeason,
	seriesId,
}): ReactElement => {
	const [seasonData, setSeasonData] = useState<seasonDataProps | null>(null);
	const [isLoading, setLoading] = useState(false);

	// Properly lock body scroll when modal is open
	useBodyLock(true);

	useEffect(() => {
		setLoading(true);
		getSeriesSeasonDetails(seriesId, activeSeason)
			.then((res) => {
				setSeasonData(res);
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
	}, [seriesId, activeSeason]);

	const isEpisodeReleased = (releaseData: string) => {
		if (!releaseData) return false;
		const currentdate = new Date().toISOString().split("T")[0];
		return (
			Number(currentdate?.split("-").join("")) -
				Number(releaseData.split("-").join("")) >=
			0
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[2055] bg-black/90 backdrop-blur-md flex flex-col items-center justify-end md:justify-center p-4"
			onClick={() => setActiveSeason(null)}
		>
			<motion.div
				initial={{ y: 50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="bg-[#1a1a1a] w-full max-w-4xl h-[85vh] md:h-[80vh] rounded-2xl md:rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
					<div className="flex flex-col gap-1">
						<h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
							<span className="text-primary">S{activeSeason < 10 ? `0${activeSeason}` : activeSeason}</span>
							<span className="text-gray-400 font-normal">|</span>
							{seasonData?.name || `Season ${activeSeason}`}
						</h2>
						{seasonData?.air_date && (
							<p className="text-xs text-gray-500 font-medium tracking-wider uppercase">
								Released: {seasonData.air_date}
							</p>
						)}
					</div>
					<button 
						onClick={() => setActiveSeason(null)}
						className="p-2 hover:bg-white/10 rounded-full transition-colors group"
					>
						<IoMdClose className="text-2xl text-gray-500 group-hover:text-white" />
					</button>
				</div>

				{/* Modal Content */}
				<div className="flex-1 overflow-y-auto p-6 scrollbar-hide no-scrollbar">
					{isLoading ? (
						<div className="h-full flex flex-col items-center justify-center gap-4 text-gray-500 italic">
							<div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
							<p>Unlocking episodes...</p>
						</div>
					) : seasonData ? (
						<div className="flex flex-col gap-6">
							{seasonData.overview && (
								<p className="text-gray-400 leading-relaxed text-sm md:text-base border-l-2 border-white/10 pl-4 italic">
									{seasonData.overview}
								</p>
							)}

							<div className="flex flex-col gap-4">
								{seasonData.episodes?.map((epi, epiId) => (
									<div
										key={epiId}
										className="group flex flex-col md:flex-row gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
									>
										{/* Episode Image / Placeholder */}
										<div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
											<Image
												unoptimized
												src={getImageBaseLink({
													type: "backdrop",
													quality: "md",
													path: epi?.still_path,
												})}
												fill
												alt=""
												className={`object-cover ${!isEpisodeReleased(epi?.air_date) ? 'grayscale opacity-30' : 'group-hover:scale-110 transition-transform duration-500'}`}
											/>
											<div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
												E{epi?.episode_number}
											</div>
											{!isEpisodeReleased(epi?.air_date) && (
												<div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/40">
													Upcoming
												</div>
											)}
										</div>

										{/* Episode Info */}
										<div className="flex-1 flex flex-col gap-2">
											<div className="flex justify-between items-start">
												<h4 className="font-bold text-gray-100 group-hover:text-primary transition-colors line-clamp-1">
													{epi?.name}
												</h4>
												<div className="flex items-center gap-1 text-primary text-sm font-bold">
													<AiFillStar className="text-xs" />
													<span>{epi?.vote_average?.toFixed(1)}</span>
												</div>
											</div>
											
											<p className="text-gray-500 text-xs md:text-sm line-clamp-2 leading-relaxed">
												{epi?.overview || "No overview available for this episode."}
											</p>

											<div className="mt-auto flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-600">
												<span>{epi?.air_date || "TBA"}</span>
												{epi?.runtime && (
													<>
														<span className="w-1 h-1 bg-gray-800 rounded-full"></span>
														<span>{epi.runtime} mins</span>
													</>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center text-gray-500 italic">
							<p>Could not fetch season details.</p>
						</div>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
};
export default SeasonsModal;
