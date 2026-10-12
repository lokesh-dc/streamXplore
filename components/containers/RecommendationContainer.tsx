"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AiFillStar } from "react-icons/ai";
import { GiSparkles } from "react-icons/gi";
import { motion } from "framer-motion";
import { movieDetails } from "@/constants/typescript";
import { getImageBaseLink } from "@/constants";
import { decorateLink, isReleased } from "@/utils";

interface RecommendationContainerProps {
	data: Array<movieDetails>;
	title: string;
	aiSeed?: { type: "movie" | "tv"; id: number; title: string };
}

const RecommendationContainer: React.FC<RecommendationContainerProps> = ({
	data,
	title,
	aiSeed,
}) => {
	if (!Array.isArray(data) || data.length === 0) return null;

	// Limit to a reasonable number of recommendations
	const recommendations = data.slice(0, 12);

	const openSimilarInChat = () => {
		if (!aiSeed) return;
		const kind = aiSeed.type === "tv" ? "TV shows" : "movies";
		window.dispatchEvent(
			new CustomEvent("hooked:chat", {
				detail: {
					text: `I'm watching ${aiSeed.title}. Find me ${kind.toLowerCase()} similar to it — pick a few and give a one-line reason for each.`,
				},
			})
		);
	};

	return (
		<div className="mt-16 mb-12">
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white border-l-4 border-primary pl-4">
					{title}
				</h2>
				{aiSeed && (
					<button
						onClick={openSimilarInChat}
						className="shrink-0 ml-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white bg-primary hover:bg-primary/80 px-3 py-2 rounded-full transition-all shadow-lg shadow-primary/20"
					>
						<GiSparkles className="text-sm" />
						Ask AI for picks
					</button>
				)}
				<div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-8"></div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
				{recommendations.map((movie, index) => {
					if (!movie.poster_path) return null;

					const movieTitle = movie.title || movie.name;
					const releaseYear = (movie.release_date || movie.first_air_date)?.split("-")[0];
					const mediaType = movie.media_type || (movie.title ? "movie" : "tv");

					return (
						<motion.div
							key={movie.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
						>
							<Link
								href={`/${mediaType}/${decorateLink(movieTitle)}/${movie.id}`}
								className="group block relative"
							>
								<div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
<Image
									unoptimized
									src={getImageBaseLink({
										path: movie.poster_path,
										type: "poster",
										quality: "lg",
									})}
									alt={movieTitle || "Movie Poster"}
									fill
									className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-90 group-hover:brightness-100"
								/>

{isReleased(movie) ? (
									typeof movie.vote_average === "number" && (
										<span className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur px-1.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-lg">
											<AiFillStar className="text-[#F5C518] text-xs" />
											{movie.vote_average.toFixed(1)}
										</span>
									)
								) : (
									<span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-md bg-[#E6501B] text-white shadow-lg">
										Coming Soon
									</span>
								)}

								{/* Overlay on hover */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
										<div className="flex items-center gap-1 text-primary mb-1 font-bold">
											<AiFillStar className="text-sm" />
											<span className="text-xs">{movie.vote_average?.toFixed(1)}</span>
										</div>
										<p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{mediaType}</p>
									</div>
								</div>

								<div className="mt-3 px-1">
									<h3 className="text-sm font-semibold text-gray-100 group-hover:text-primary transition-colors line-clamp-1">
										{movieTitle}
									</h3>
									<p className="text-xs text-gray-500 font-medium mt-1">
										{releaseYear}
									</p>
								</div>
							</Link>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
};

export default RecommendationContainer;
