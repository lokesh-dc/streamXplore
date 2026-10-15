"use client";
import React, { ReactElement, useEffect, useState } from "react";
import { IoMdClose, IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { AiFillStar } from "react-icons/ai";
import { FiClock, FiCalendar } from "react-icons/fi";
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
	const [direction, setDirection] = useState(0);

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

	const handlePrevSeason = () => {
		if (activeSeason > 1) {
			setDirection(-1);
			setActiveSeason(activeSeason - 1);
		}
	};

	const handleNextSeason = () => {
		if (activeSeason < totalSeasons) {
			setDirection(1);
			setActiveSeason(activeSeason + 1);
		}
	};

	const hasMultipleSeasons = totalSeasons > 1;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="fixed inset-0 z-[2055] bg-black/70 backdrop-blur-xl flex flex-col items-center justify-end md:justify-center p-2 md:p-4"
			onClick={() => setActiveSeason(null)}
		>
			<motion.div
				initial={{ y: 40, opacity: 0, scale: 0.98 }}
				animate={{ y: 0, opacity: 1, scale: 1 }}
				exit={{ y: 40, opacity: 0, scale: 0.98 }}
				transition={{ type: "spring", damping: 30, stiffness: 400 }}
				className="bg-gradient-to-b from-[#141414] to-[#0f0f0f] w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-2xl md:rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="relative border-b border-white/10">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.05),transparent_70%)]" />

					<div className="relative flex items-start justify-between gap-3 p-4 md:p-6">
						<div className="flex flex-col gap-2 min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2 md:gap-3">
								<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-md shadow-lg shadow-primary/10">
									<span className="text-primary font-black text-xs md:text-sm tracking-wide">
										SEASON{" "}
										{activeSeason < 10
											? `0${activeSeason}`
											: activeSeason}
									</span>
								</div>
								{seasonData?.episodes?.length > 0 && (
									<div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-300">
										{seasonData.episodes.length}{" "}
										{seasonData.episodes.length === 1
											? "Episode"
											: "Episodes"}
									</div>
								)}
								{seasonData?.vote_average > 0 && (
									<div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 backdrop-blur-md">
										<AiFillStar className="text-amber-400 text-xs" />
										<span className="text-amber-400 font-bold text-xs md:text-sm">
											{seasonData.vote_average.toFixed(1)}
										</span>
									</div>
								)}
							</div>

							<h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight line-clamp-2">
								{seasonData?.name || `Season ${activeSeason}`}
							</h2>

							{seasonData?.air_date && (
								<div className="flex items-center gap-2 text-gray-400">
									<FiCalendar className="text-sm" />
									<p className="text-xs md:text-sm font-medium">
										Released {seasonData.air_date}
									</p>
								</div>
							)}

							{seasonData?.overview && (
								<p className="text-gray-300 leading-relaxed text-xs md:text-sm line-clamp-2 md:line-clamp-3 mt-1">
									{seasonData.overview}
								</p>
							)}
						</div>

						<button
							onClick={() => setActiveSeason(null)}
							className="p-2 md:p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 group border border-transparent hover:border-white/20 backdrop-blur-md flex-shrink-0"
						>
							<IoMdClose className="text-xl md:text-2xl text-gray-400 group-hover:text-white transition-colors" />
						</button>
					</div>

					{/* Season Navigation */}
					{hasMultipleSeasons && (
						<div className="relative px-4 md:px-6 pb-4 flex items-center justify-between gap-4">
							<button
								onClick={handlePrevSeason}
								disabled={activeSeason <= 1}
								className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border backdrop-blur-md transition-all duration-200 ${
									activeSeason <= 1
										? "opacity-40 cursor-not-allowed border-white/10 bg-white/5"
										: "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30 active:scale-95"
								}`}
							>
								<IoMdArrowBack className="text-base md:text-lg text-gray-300 group-hover:text-white transition-colors" />
								<span className="text-xs md:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors hidden sm:block">
									Prev Season
								</span>
							</button>

							{/* Season Dots */}
							<div className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide no-scrollbar px-2">
								{Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
									(seasonNum) => (
										<button
											key={seasonNum}
											onClick={() => {
												if (seasonNum > activeSeason) setDirection(1);
												if (seasonNum < activeSeason) setDirection(-1);
												setActiveSeason(seasonNum);
											}}
											className={`relative flex items-center justify-center w-7 h-7 md:w-8 md:h-8 flex-shrink-0 rounded-full border transition-all duration-300 ${
												seasonNum === activeSeason
													? "bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-110"
													: "bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:border-white/25 hover:text-white hover:scale-105"
											}`}
										>
											<span className="text-[11px] md:text-xs font-black">
												{seasonNum}
											</span>
											{seasonNum === activeSeason && (
												<motion.div
													layoutId="seasonDot"
													className="absolute inset-0 rounded-full bg-primary/20 -z-10"
													transition={{ type: "spring", damping: 20, stiffness: 400 }}
												/>
											)}
										</button>
									)
								)}
							</div>

							<button
								onClick={handleNextSeason}
								disabled={activeSeason >= totalSeasons}
								className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border backdrop-blur-md transition-all duration-200 ${
									activeSeason >= totalSeasons
										? "opacity-40 cursor-not-allowed border-white/10 bg-white/5"
										: "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30 active:scale-95"
								}`}
							>
								<span className="text-xs md:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors hidden sm:block">
									Next Season
								</span>
								<IoMdArrowForward className="text-base md:text-lg text-gray-300 group-hover:text-white transition-colors" />
							</button>
						</div>
					)}
				</div>

				{/* Modal Content */}
				<div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-5 scrollbar-hide no-scrollbar">
					{isLoading ? (
						<div className="h-full flex flex-col items-center justify-center gap-5 text-gray-400">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								className="relative w-12 h-12"
							>
								<div className="absolute inset-0 rounded-full border-2 border-primary/20" />
								<div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent" />
							</motion.div>
							<div className="flex flex-col items-center gap-1.5">
								<p className="text-sm md:text-base font-medium text-gray-300">
									Loading episodes
								</p>
								<p className="text-xs text-gray-500">
									Fetching season details...
								</p>
							</div>
						</div>
					) : seasonData ? (
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={activeSeason}
								initial={{
									opacity: 0,
									x: direction > 0 ? 20 : direction < 0 ? -20 : 0,
								}}
								animate={{ opacity: 1, x: 0 }}
								exit={{
									opacity: 0,
									x: direction > 0 ? -20 : direction < 0 ? 20 : 0,
								}}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="flex flex-col gap-4 md:gap-5"
							>
								{seasonData.episodes?.map((epi, epiId) => {
									const released = isEpisodeReleased(epi?.air_date);
									return (
										<motion.div
											key={`${activeSeason}-${epiId}`}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: epiId * 0.03 }}
											className="group flex flex-col md:flex-row gap-3 md:gap-5 p-2.5 md:p-3.5 rounded-2xl md:rounded-3xl hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm"
										>
											{/* Episode Image */}
											<div className="relative w-full md:w-56 lg:w-64 aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 ring-1 ring-black/40 shadow-inner">
												<Image
													unoptimized
													src={getImageBaseLink({
														type: "backdrop",
														quality: "md",
														path: epi?.still_path,
													})}
													fill
													alt={epi?.name || `Episode ${epi?.episode_number}`}
													className={`object-cover transition-all duration-700 ease-out ${
														!released
															? "grayscale opacity-40"
															: "group-hover:scale-110"
													}`}
												/>
												{/* Gradient overlays */}
												<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
												<div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

												{/* Episode Number */}
												<div className="absolute top-2 left-2 md:top-2.5 md:left-2.5 flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 shadow-lg">
													<span className="text-[10px] md:text-xs font-black text-white tracking-wide">
														E{epi?.episode_number}
													</span>
												</div>

												{/* Rating Badge */}
												{epi?.vote_average > 0 && released && (
													<div className="absolute top-2 right-2 md:top-2.5 md:right-2.5 flex items-center gap-0.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-amber-500/90 backdrop-blur-md border border-amber-400/40 shadow-lg">
														<AiFillStar className="text-white text-[9px] md:text-[11px]" />
														<span className="text-[10px] md:text-xs font-black text-white">
															{epi?.vote_average?.toFixed(1)}
														</span>
													</div>
												)}

												{/* Runtime Badge */}
												{epi?.runtime && released && (
													<div className="absolute bottom-2 right-2 md:bottom-2.5 md:right-2.5 flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 shadow-lg">
														<FiClock className="text-white text-[9px] md:text-[11px]" />
														<span className="text-[10px] md:text-xs font-bold text-white">
															{epi.runtime}m
														</span>
													</div>
												)}

												{/* Upcoming Overlay */}
												{!released && (
													<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
														<div className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-xl">
															<span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-white/90">
																Upcoming
															</span>
														</div>
													</div>
												)}
											</div>

											{/* Episode Info */}
											<div className="flex-1 flex flex-col gap-2 md:gap-3 min-w-0">
												<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
													<h4 className="font-bold text-gray-100 group-hover:text-white transition-colors text-sm md:text-lg leading-tight line-clamp-2">
														{epi?.name}
													</h4>
												</div>

												<p className="text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
													{epi?.overview ||
														"No overview available for this episode."}
												</p>

												<div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-[10px] md:text-xs font-medium text-gray-500">
													<div className="flex items-center gap-1.5">
														<FiCalendar className="text-[11px]" />
														<span>
															{epi?.air_date || "TBA"}
														</span>
													</div>
													{epi?.runtime && released && (
														<>
															<span className="w-1 h-1 bg-gray-700 rounded-full" />
															<div className="flex items-center gap-1.5">
																<FiClock className="text-[11px]" />
																<span>{epi.runtime} minutes</span>
															</div>
														</>
													)}
												</div>
											</div>
										</motion.div>
									);
								})}
							</motion.div>
						</AnimatePresence>
					) : (
						<div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
							<div className="p-4 rounded-full bg-white/5 border border-white/10">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
									/>
								</svg>
							</div>
							<p className="text-sm md:text-base font-medium text-gray-300">
								Couldn’t load season details
							</p>
							<p className="text-xs text-gray-500">
								Try selecting another season
							</p>
						</div>
					)}
				</div>
			</motion.div>
		</motion.div>
	);
};
export default SeasonsModal;