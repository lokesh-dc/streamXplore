"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { AiFillStar } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

import { getImageBaseLink } from "@/constants";
import { genresType, movieVideos } from "@/constants/typescript";
import YoutubeVideoModal from "@/modals/YoutubeVideoModal";
import SeasonsContainer from "@/components/containers/SeasonsContianer";
import CastSection from "@/components/ui/detail/CastSection";
import ShareIntentComponent from "@/components/functional-components/ShareIntentComponent";
import WatchlistButton from "@/components/functional-components/WatchlistButton";
import { Button } from "@/components/buttons";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import styles from "@/styles/MovieContainer.module.css";

interface DetailV2Props {
	data: any;
	credits: any;
	videos: Array<movieVideos>;
	isTv?: boolean;
}

const formatRuntime = (minutes?: number) => {
	if (!minutes || Number.isNaN(minutes)) return null;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours && mins) return `${hours}h ${mins}m`;
	if (hours) return `${hours}h`;
	return `${mins}m`;
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
	<h2 className="font-display text-2xl leading-none text-text-primary md:text-3xl">
		{children}
	</h2>
);

const InfoRow = ({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) => (
	<div className="flex items-start justify-between gap-6 border-b border-white/5 py-3">
		<dt className="shrink-0 text-text-secondary">{label}</dt>
		<dd className="text-right font-medium text-text-primary">{value}</dd>
	</div>
);

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
		tagline,
		status,
	} = data;

	const displayTitle = title || name || "Untitled";
	const cast = credits?.cast?.slice(0, 15) || [];
	const isReleasedYear = release_date?.split("-")[0];

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

	const firstYear = first_air_date?.split("-")[0];
	const lastYear = last_air_date?.split("-")[0];
	const isOngoing =
		status === "Returning Series" ||
		status === "In Production" ||
		status === "Planned";
	const yearLabel = isTv
		? firstYear
			? `${firstYear}${
					lastYear && lastYear !== firstYear
						? `–${lastYear}`
						: isOngoing
							? "–"
							: ""
				}`
			: ""
		: isReleasedYear || "";

	const runtimeLabel = isTv
		? episode_run_time?.[0]
			? `${episode_run_time[0]}m`
			: null
		: formatRuntime(runtime);

	const translation = spoken_languages?.[0]?.name || "English";
	const imdbId = imdb_id || external_ids?.imdb_id;
	const listHref = isTv ? "tv-series" : "movies";
	const listLabel = isTv ? "TV Series" : "Movies";

	const trailerVideos = Array.isArray(videos)
		? videos.filter((video: any) => video?.key)
		: [];
	const featuredVideo =
		trailerVideos.find((v: any) => v.type === "Trailer" && v.official) ||
		trailerVideos.find((v: any) => v.type === "Trailer") ||
		trailerVideos[0];
	const clipVideos = trailerVideos.filter(
		(video: any) => video.key !== featuredVideo?.key,
	);

	const openVideo = (video: movieVideos) => {
		const index = trailerVideos.findIndex((v: any) => v.key === video.key);
		setVideoModal({
			position: index < 0 ? 0 : index,
			key: video.key,
			title: video.name,
		});
	};

	const handlePlayTrailer = () => {
		if (featuredVideo) openVideo(featuredVideo);
	};

	const backdrop_url = getImageBaseLink({
		type: "backdrop",
		quality: "lg",
		path: data.backdrop_path || data.poster_path,
	});

	const poster_url = getImageBaseLink({
		type: "poster",
		quality: "xl",
		path: poster_path,
	});

	const dot = (
		<span aria-hidden className="h-1 w-1 rounded-full bg-white/25" />
	);

	return (
		<div className="relative min-h-screen font-sans text-text-primary">
			{/* Cinematic backdrop */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[76vh] min-h-[560px] overflow-hidden">
				<Image
					unoptimized
					src={backdrop_url}
					alt={`${displayTitle} backdrop`}
					fill
					priority
					sizes="100vw"
					className="object-cover object-top opacity-60"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/60 to-bg-main/10" />
				<div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/55 to-transparent" />
			</div>

			{/* Hero */}
			<div className="shell relative z-10 pb-12 pt-[calc(var(--nav-h,72px)_+_3rem)]">
				<nav
					aria-label="Breadcrumb"
					className="mb-10 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
					<Link href="/" className="transition-colors hover:text-text-primary">
						Home
					</Link>
					<FiChevronRight className="opacity-40" />
					<Link
						href={`/${listHref}`}
						className="transition-colors hover:text-text-primary">
						{listLabel}
					</Link>
					<FiChevronRight className="opacity-40" />
					<span className="max-w-[34ch] truncate text-text-primary/70">
						{displayTitle}
					</span>
				</nav>

				<div className="flex max-w-3xl flex-col gap-5">
					<span className="eyebrow">
						{isTv ? "Series" : "Film"}
						{status ? ` · ${status}` : ""}
					</span>

					<h1 className="text-balance font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.9] text-text-primary">
						{displayTitle}
					</h1>

					{tagline ? (
						<p className="max-w-2xl text-lg italic text-text-secondary">
							&ldquo;{tagline}&rdquo;
						</p>
					) : null}

					<div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-text-secondary">
						<span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-text-primary">
							<AiFillStar className="text-primary" />
							{vote_average ? vote_average.toFixed(1) : "—"}
						</span>
						{vote_count ? (
							<span>{vote_count.toLocaleString()} ratings</span>
						) : null}
						{yearLabel ? (
							<>
								{dot}
								<span>{yearLabel}</span>
							</>
						) : null}
						{runtimeLabel ? (
							<>
								{dot}
								<span>{runtimeLabel}</span>
							</>
						) : null}
						{isTv && number_of_seasons ? (
							<>
								{dot}
								<span>{number_of_seasons} seasons</span>
							</>
						) : null}
					</div>

					{genres?.length ? (
						<div className="flex flex-wrap gap-2 pt-1">
							{genres.map((genre: genresType) => (
								<Link
									key={genre.id}
									href={`/${listHref}?genre=${genre.id}`}
									className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary">
									{genre.name}
								</Link>
							))}
						</div>
					) : null}

					<div className="mt-3 flex flex-wrap items-center gap-3">
						<Button
							size="lg"
							leftIcon={<FaPlay className="text-xs" />}
							onClick={handlePlayTrailer}
							disabled={!featuredVideo}
							className="bg-white text-black">
							{featuredVideo ? "Play trailer" : "No trailer"}
						</Button>
						<WatchlistButton
							id={data.id}
							mediaType={isTv ? "tv" : "movie"}
							title={displayTitle}
							posterPath={poster_path}
						/>
						<ShareIntentComponent
							title={displayTitle}
							posterUrl={poster_url}
							className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:bg-white/10"
						/>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="shell relative z-10 grid gap-12 pb-24 pt-4 lg:grid-cols-[320px_1fr] lg:gap-16">
				<aside className="flex flex-col gap-8 self-start lg:sticky lg:top-[calc(var(--nav-h,72px)_+_2rem)]">
					<div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-2xl">
						<Image
							unoptimized
							src={poster_url}
							alt={`${displayTitle} official poster`}
							width={350}
							height={525}
							className="h-auto w-full object-cover"
						/>
						<span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-sm font-bold text-white backdrop-blur">
							<AiFillStar className="text-primary" />
							{vote_average ? vote_average.toFixed(1) : "—"}
						</span>
					</div>

					<dl className="flex flex-col text-sm">
						<InfoRow
							label={isTv ? "Creator" : "Director"}
							value={creatorOrProducer}
						/>
						<InfoRow
							label={isTv ? "First aired" : "Released"}
							value={yearLabel || "—"}
						/>
						{isTv ? (
							<InfoRow
								label="Episodes"
								value={number_of_episodes ? `${number_of_episodes}` : "—"}
							/>
						) : (
							<InfoRow
								label="Runtime"
								value={formatRuntime(runtime) || "—"}
							/>
						)}
						<InfoRow label="Language" value={translation} />
						<InfoRow
							label="Popularity"
							value={popularity ? `${Math.round(popularity)}` : "—"}
						/>
						{status ? <InfoRow label="Status" value={status} /> : null}
						{imdbId ? (
							<InfoRow
								label="IMDb"
								value={
									<a
										href={`https://www.imdb.com/title/${imdbId}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary transition-colors hover:text-primary/80">
										Open ↗
									</a>
								}
							/>
						) : null}
					</dl>
				</aside>

				<div className="flex min-w-0 flex-col gap-14">
					{overview ? (
						<section className="flex flex-col gap-4">
							<SectionTitle>Overview</SectionTitle>
							<p className="max-w-3xl text-lg leading-relaxed text-text-secondary">
								{overview}
							</p>
						</section>
					) : null}

					{isTv && seasons?.length ? (
						<section className="flex flex-col gap-4">
							<SectionTitle>Seasons</SectionTitle>
							<SeasonsContainer data={seasons} seriesId={data.id} />
						</section>
					) : null}

					{cast.length ? (
						<CastSection cast={cast} />
					) : null}

					{featuredVideo ? (
						<section className="flex flex-col gap-5">
							<SectionTitle>Trailers &amp; clips</SectionTitle>

							<button
								type="button"
								onClick={handlePlayTrailer}
								aria-label={`Play ${featuredVideo.name}`}
								className="group relative block aspect-video w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-black text-left shadow-2xl">
								<Image
									unoptimized
									src={`https://img.youtube.com/vi/${featuredVideo.key}/maxresdefault.jpg`}
									alt={`${displayTitle} trailer thumbnail`}
									fill
									sizes="(max-width: 1024px) 100vw, 768px"
									className="object-cover brightness-[0.55] transition-all duration-500 ease-smooth group-hover:scale-[1.03] group-hover:brightness-75"
								/>
								<span className="absolute inset-0 flex items-center justify-center">
									<span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md transition-transform duration-300 ease-smooth group-hover:scale-110">
										<FaPlay className="ml-1 text-xl text-white" />
									</span>
								</span>
								<span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4 pt-14">
									<span className="eyebrow">
										{featuredVideo.type}
										{featuredVideo.official ? " · Official" : ""}
									</span>
									<span className="line-clamp-1 text-base font-semibold text-white">
										{featuredVideo.name}
									</span>
								</span>
							</button>

							{clipVideos.length ? (
								<div className="relative">
									<Swiper
										slidesPerView="auto"
										spaceBetween={14}
										freeMode={true}
										mousewheel={{
											forceToAxis: true,
											releaseOnEdges: true,
										}}
										modules={[Mousewheel, FreeMode]}
										className={`w-full ${styles.swiperContainer} overscroll-x-contain touch-pan-y`}>
										{clipVideos.map((video: any) => (
											<SwiperSlide
												key={video.id}
												className="!w-fit pb-2">
												<button
													type="button"
													onClick={() => openVideo(video)}
													aria-label={`Play ${video.name}`}
													className="group block w-[220px] text-left">
													<span className="relative block aspect-video overflow-hidden rounded-lg border border-white/10 bg-black">
														<Image
															unoptimized
															src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
															alt={video.name}
															fill
															sizes="220px"
															className="object-cover brightness-[0.85] transition-all duration-500 ease-smooth group-hover:scale-105 group-hover:brightness-100"
														/>
														<span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 ease-smooth group-hover:opacity-100">
															<span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
																<FaPlay className="ml-0.5 text-xs text-white" />
															</span>
														</span>
														<span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur">
															{video.type}
														</span>
													</span>
													<span className="mt-2 block line-clamp-2 text-xs font-medium leading-snug text-text-primary transition-colors group-hover:text-primary">
														{video.name}
													</span>
												</button>
											</SwiperSlide>
										))}
									</Swiper>
								</div>
							) : null}
						</section>
					) : null}
				</div>
			</div>

			<AnimatePresence>
				{modalVideo && (
					<YoutubeVideoModal
						videoId={modalVideo.key}
						title={modalVideo.title}
						position={modalVideo.position}
						changeModalVideo={(position: number, key: string, name: string) => {
							if (key) {
								setVideoModal({ position, key, title: name });
							} else {
								setVideoModal(null);
							}
						}}
						data={trailerVideos}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DetailV2;
