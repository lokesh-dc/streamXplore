"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineShareAlt } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { getImageBaseLink } from "@/constants";
import { genresType, movieVideos } from "@/constants/typescript";
import YoutubeVideoModal from "@/modals/YoutubeVideoModal";
import { AnimatePresence } from "framer-motion";
import SeasonsContainer from "@/components/containers/SeasonsContianer";

interface DetailV2Props {
	data: any;
	credits: any;
	videos: Array<movieVideos>;
	isTv?: boolean;
}

const DetailV2: React.FC<DetailV2Props> = ({
	data,
	credits,
	videos,
	isTv = false,
}) => {
	const [modalVideo, setVideoModal] = useState<{
		position: number;
		key: string;
		title: string;
	} | null>(null);

	const {
		title,
		name, // for TV
		release_date,
		first_air_date, // for TV
		last_air_date, // for TV
		runtime,
		episode_run_time, // for TV
		overview,
		vote_average,
		vote_count,
		genres,
		poster_path,
		spoken_languages,
		seasons, // for TV
		number_of_seasons, // for TV
		number_of_episodes, // for TV
		created_by, // for TV
		popularity,
		imdb_id,
		external_ids,
	} = data;

	const displayTitle = title || name;
	const cast = credits?.cast?.slice(0, 7) || [];

	// Producer / Creator logic
	let creatorOrProducer = "N/A";
	if (isTv) {
		creatorOrProducer =
			created_by?.map((c: any) => c.name).join(", ") ||
			credits?.crew?.find((p: any) => p.job === "Executive Producer")?.name ||
			"N/A";
	} else {
		const director = credits?.crew?.find(
			(person: any) => person.job === "Director",
		)?.name;
		const producer = credits?.crew?.find(
			(person: any) => person.job === "Producer",
		)?.name;
		creatorOrProducer = director || producer || "N/A";
	}

	const year = isTv
		? `${first_air_date?.split("-")[0] || ""}${last_air_date ? ` - ${last_air_date.split("-")[0]}` : ""}`
		: release_date?.split("-")[0] || "N/A";

	const duration = isTv
		? `${episode_run_time?.[0] || "N/A"} min/ep`
		: runtime
			? `${Math.floor(runtime / 60)}:${(runtime % 60).toString().padStart(2, "0")}`
			: "N/A";

	const translation = spoken_languages?.[0]?.name || "English";
	const imdbId = imdb_id || external_ids?.imdb_id;

	const mainTrailer =
		videos?.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
		videos?.[0];

	const handlePlayTrailer = () => {
		if (mainTrailer) {
			const index = videos.indexOf(mainTrailer);
			setVideoModal({
				position: index >= 0 ? index : 0,
				key: mainTrailer.key,
				title: mainTrailer.name,
			});
		}
	};

	const backdrop_url = getImageBaseLink({
		type: "backdrop",
		quality: "lg",
		path: data.backdrop_path || data.poster_path,
	});

	return (
		<div className="bg-[#121212] text-white min-h-screen font-sans pb-12 relative">
			{/* Cinematic Backdrop */}
			<div className="absolute top-0 left-0 w-full h-[85vh] z-0">
				<Image
					unoptimized
					src={backdrop_url}
					alt={displayTitle}
					fill
					priority
					className="object-cover object-top opacity-40"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent"></div>
			</div>

			<div className="relative z-10 pt-32 default_screen_padding">
				{/* Title and Rating Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
					<div className="flex flex-col gap-2">
						<h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
							{displayTitle}
						</h1>
						<div className="flex items-center gap-4 text-sm">
							<div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md border border-yellow-500/20">
								<AiFillStar />
								<span className="font-bold">{vote_average?.toFixed(1)}</span>
							</div>
							<div className="text-gray-400 font-medium">
								{vote_count?.toLocaleString()} reviews
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex text-yellow-500 text-xl">
							{[...Array(5)].map((_, i) => (
								<AiFillStar
									key={i}
									className={
										i < Math.round(vote_average / 2)
											? "text-yellow-500"
											: "text-gray-600/50"
									}
								/>
							))}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12 items-start">
					{/* Left Column: Poster and Buttons (Sticky on Desktop) */}
					<div className="flex flex-col gap-6 lg:sticky lg:top-28 self-start">
						<div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900">
							<Image
								unoptimized
								src={getImageBaseLink({
									type: "poster",
									quality: "xl",
									path: poster_path,
								})}
								alt={displayTitle}
								width={350}
								height={525}
								className="w-full h-auto object-cover"
							/>
						</div>
						<div className="flex items-center gap-4">
							<button
								onClick={handlePlayTrailer}
								className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-3 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold border border-white/10">
								<FaPlay className="text-sm" /> Trailer
							</button>
							<button className="p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10">
								<BsBookmark className="text-xl" />
							</button>
							<button className="p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10">
								<AiOutlineShareAlt className="text-xl" />
							</button>
						</div>
					</div>

					{/* Right Column: Info, Cast, Overview and Video */}
					<div className="flex flex-col gap-10">
						{/* Info and Cast Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Movie/TV Info */}
							<div className="space-y-4">
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<span className="text-gray-500 font-medium">
										{isTv ? "Creator" : "Producer"}:
									</span>
									<span className="text-gray-200">{creatorOrProducer}</span>
								</div>
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<span className="text-gray-500 font-medium">Year:</span>
									<span className="text-gray-200">{year}</span>
								</div>
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<span className="text-gray-500 font-medium">Genre:</span>
									<span className="text-gray-200">
										{genres?.map((g: genresType) => g.name).join(", ")}
									</span>
								</div>
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<span className="text-gray-500 font-medium">
										Popularity:
									</span>
									<span className="text-gray-200">
										{Math.round(popularity)}
									</span>
								</div>
								<div className="grid grid-cols-[120px_1fr] gap-2">
									<span className="text-gray-500 font-medium">Duration:</span>
									<span className="text-gray-200">{duration}</span>
								</div>
								{imdbId && (
									<div className="grid grid-cols-[120px_1fr] gap-2">
										<span className="text-gray-500 font-medium">IMDb:</span>
										<a
											href={`https://www.imdb.com/title/${imdbId}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline font-medium">
											View on IMDb
										</a>
									</div>
								)}
								{isTv && (
									<div className="grid grid-cols-[120px_1fr] gap-2">
										<span className="text-gray-500 font-medium">Seasons:</span>
										<span className="text-gray-200">
											{number_of_seasons} ({number_of_episodes} eps)
										</span>
									</div>
								)}
							</div>

							{/* Cast List */}
							<div className="space-y-4">
								<div className="grid grid-cols-[80px_1fr] gap-2">
									<span className="text-gray-500 font-medium">Cast:</span>
									<div className="flex flex-col gap-1">
										{cast.map((person: any, idx: number) => (
											<span key={idx} className="text-gray-200">
												{person.name}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Overview */}
						<div className="max-w-4xl">
							<p className="text-gray-300 leading-relaxed text-lg">{overview}</p>
						</div>

						{/* Seasons Section for TV */}
						{isTv && seasons && (
							<div className="mt-4">
								<SeasonsContainer data={seasons} seriesId={data.id} />
							</div>
						)}

						{/* Video Thumbnail Section */}
						{mainTrailer && (
							<div
								onClick={handlePlayTrailer}
								className="relative group max-w-2xl rounded-2xl overflow-hidden cursor-pointer border border-white/10 aspect-video bg-black">
								<Image
									unoptimized
									src={`https://img.youtube.com/vi/${mainTrailer.key}/maxresdefault.jpg`}
									alt="Trailer thumbnail"
									fill
									className="object-cover brightness-50 group-hover:brightness-75 transition-all"
								/>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
										<FaPlay className="text-white text-xl ml-1" />
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<AnimatePresence>
				{modalVideo && (
					<YoutubeVideoModal
						videoId={modalVideo.key}
						title={modalVideo.title}
						position={modalVideo.position}
						changeModalVideo={(val: any) => {
							if (val.key) {
								setVideoModal(val);
							} else {
								setVideoModal(null);
							}
						}}
						data={videos}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DetailV2;
