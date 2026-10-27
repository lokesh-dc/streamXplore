"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AiFillStar } from "react-icons/ai";
import { FiArrowDown, FiArrowRight } from "react-icons/fi";

import ProviderLogo from "@/components/ui/streaming/ProviderLogo";
import { getImageBaseLink } from "@/constants";
import type { movieDetails } from "@/constants/typescript";
import type { WatchProvider } from "@/dataFetchings/getWatchProviders";
import { decorateLink } from "@/utils";

interface StreamingHeroProps {
	provider: WatchProvider;
	regionLabel: string;
	mediaType: "movie" | "tv";
	availabilityLabel: string;
	featured: movieDetails | null;
	totalResults: number | null;
}

const StreamingHero = ({
	provider,
	regionLabel,
	mediaType,
	availabilityLabel,
	featured,
	totalResults,
}: StreamingHeroProps) => {
	const title = featured?.title || featured?.name || null;
	const originalTitle =
		featured?.original_title || featured?.original_name || null;
	const displayTitle = title || originalTitle || provider.provider_name;
	const releaseDate = featured?.release_date || featured?.first_air_date;
	const year = releaseDate ? releaseDate.slice(0, 4) : null;
	const rating =
		typeof featured?.vote_average === "number" && featured.vote_average > 0
			? featured.vote_average.toFixed(1)
			: null;
	const backdrop = featured?.backdrop_path;
	const detailHref =
		featured?.id && title
			? `/${mediaType}/${decorateLink(title)}/${featured.id}`
			: null;
	const mediaLabel = mediaType === "movie" ? "movies" : "series";
	const heroKey = `${provider.provider_id}-${mediaType}-${featured?.id || "empty"}`;

	return (
		<header className="relative isolate overflow-hidden bg-[#0a0908]">
			<div className="absolute inset-0">
				<AnimatePresence mode="sync">
					{backdrop ? (
						<motion.div
							key={backdrop}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
							className="absolute inset-0">
							<Image
								unoptimized
								priority
								fill
								sizes="100vw"
								src={getImageBaseLink({
									type: "backdrop",
									quality: "lg",
									path: backdrop,
								})}
								alt=""
								className="object-cover object-[center_30%]"
							/>
						</motion.div>
					) : (
						<div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_0%,rgba(255,90,31,0.2),transparent_58%)]" />
					)}
				</AnimatePresence>

				<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,9,8,0.98)_0%,rgba(10,9,8,0.84)_38%,rgba(10,9,8,0.2)_72%,rgba(10,9,8,0.55)_100%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(0deg,#0a0908_0%,rgba(10,9,8,0.55)_28%,transparent_64%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_18%_50%,rgba(10,9,8,0.45),transparent_65%)]" />
			</div>

			<div className="shell relative flex min-h-[600px] flex-col justify-end pb-12 pt-28 sm:min-h-[640px] md:pb-16 md:pt-32 lg:min-h-[700px]">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
					<motion.div
						key={heroKey}
						initial={{ opacity: 0, y: 22 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
						className="max-w-4xl min-w-0">
						<div className="flex flex-wrap items-center gap-3">
							<ProviderLogo provider={provider} size="sm" />
							<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/85">
								{provider.provider_name}
							</span>
							<span className="h-3 w-px bg-white/20" />
							<span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
								<span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,90,31,0.75)]" />
								Now streaming
							</span>
							<span className="h-3 w-px bg-white/20" />
							<span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
								{regionLabel}
							</span>
						</div>

						<h1 className="mt-5 text-balance break-words font-display text-[clamp(3.5rem,8.4vw,8.5rem)] uppercase leading-[0.8] text-white [text-shadow:0_24px_60px_rgba(0,0,0,0.55)]">
							{displayTitle}
						</h1>

						{featured ? (
							<div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
								<span className="text-white/80">
									{mediaType === "movie" ? "Film" : "Series"}
								</span>
								{year ? (
									<span className="inline-flex items-center gap-4">
										<span className="h-1 w-1 rounded-full bg-white/30" />
										<span>{year}</span>
									</span>
								) : null}
								{rating ? (
									<span className="inline-flex items-center gap-4">
										<span className="h-1 w-1 rounded-full bg-white/30" />
										<span className="inline-flex items-center gap-1.5 text-white/80">
											<AiFillStar className="text-primary" />
											{rating}
										</span>
									</span>
								) : null}
								<span className="inline-flex items-center gap-4">
									<span className="h-1 w-1 rounded-full bg-white/30" />
									<span className="text-primary">{availabilityLabel}</span>
								</span>
							</div>
						) : null}

						{featured?.overview ? (
							<p className="mt-5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
								{featured.overview}
							</p>
						) : null}

						<div className="mt-7 flex flex-wrap items-center gap-3">
							{detailHref ? (
								<Link
									href={detailHref}
									className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0a0908] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
									View title
									<FiArrowRight className="text-sm transition-transform group-hover:translate-x-0.5" />
								</Link>
							) : null}
							<a
								href="#catalogue"
								className="group inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
								Browse catalogue
								<FiArrowDown className="text-sm transition-transform group-hover:translate-y-0.5" />
							</a>
						</div>
					</motion.div>

					{totalResults != null ? (
						<div className="hidden flex-col items-end gap-2 pb-2 text-right lg:flex">
							<span className="eyebrow text-white/35">Catalogue size</span>
							<span className="font-display text-[clamp(5rem,8vw,9rem)] leading-[0.75] text-white/20 tabular-nums">
								{totalResults.toLocaleString("en-US")}
							</span>
							<span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35">
								{mediaLabel} in {regionLabel}
							</span>
						</div>
					) : null}
				</div>
			</div>
		</header>
	);
};

export default StreamingHero;
