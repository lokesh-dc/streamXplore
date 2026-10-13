"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

import { AiTwotoneStar } from "react-icons/ai";
import { GiSparkles } from "react-icons/gi";

import styles from "@/styles/MovieContainer.module.css";
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
	const recommendations = Array.isArray(data)
		? data.filter((item) => item.poster_path).slice(0, 12)
		: [];

	if (!recommendations.length) return null;

	const openSimilarInChat = () => {
		if (!aiSeed) return;
		const kind = aiSeed.type === "tv" ? "TV shows" : "movies";
		window.dispatchEvent(
			new CustomEvent("hooked:chat", {
				detail: {
					text: `I'm watching ${aiSeed.title}. Find me ${kind.toLowerCase()} similar to it — pick a few and give a one-line reason for each.`,
				},
			}),
		);
	};

	return (
		<section className="py-16">
			<header className="mb-7 flex flex-wrap items-end justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-2">
					<span className="eyebrow">Recommended for you</span>
					<h2 className="font-display text-4xl leading-none text-text-primary md:text-5xl">
						{title}
					</h2>
				</div>

				{aiSeed && (
					<button
						onClick={openSimilarInChat}
						className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff8a5c] transition-colors hover:bg-primary/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
						<GiSparkles className="text-sm transition-transform duration-300 ease-smooth group-hover:rotate-12" />
						Ask AI for picks
					</button>
				)}
			</header>

			<div className="hairline mb-3" />

			<div className={styles.rowMaskWrap}>
				<Swiper
					slidesPerView="auto"
					spaceBetween={18}
					freeMode={true}
					mousewheel={{
						forceToAxis: true,
						releaseOnEdges: true,
					}}
					modules={[Mousewheel, FreeMode]}
					className={`w-full ${styles.swiperContainer} overscroll-x-contain touch-pan-y`}>
					{recommendations.map((item, index) => {
						const movieTitle = item.title || item.name || "Untitled";
						const year = (
							item.release_date || item.first_air_date
						)?.split("-")[0];
						const mediaType =
							item.media_type || (item.title ? "movie" : "tv");
						const mediaLabel = mediaType === "tv" ? "Series" : "Film";
						const released = isReleased(item);
						const rating = item.vote_average;
						const hasRating =
							released && typeof rating === "number" && rating > 0;

						return (
							<SwiperSlide
								key={`${item.id ?? index}-${index}`}
								className="!w-fit pb-2">
								<Link
									href={`/${mediaType}/${decorateLink(movieTitle)}/${item.id}`}
									className="group flex w-[232px] flex-col align-top max-[600px]:w-[156px]">
									<div className={`${styles.scroll_card} relative`}>
										<div className={styles.cardImage}>
											<Image
												unoptimized
												width={500}
												height={750}
												src={getImageBaseLink({
													path: item.poster_path,
													type: "poster",
													quality: "lg",
												})}
												alt={`${movieTitle} poster`}
												className={styles.cardImg}
											/>
										</div>

										{/* Editorial index */}
										<span
											aria-hidden
											className="pointer-events-none absolute left-3 top-1.5 z-[2] font-display text-4xl leading-none tabular text-white/30 transition-colors duration-300 ease-smooth group-hover:text-primary">
											{String(index + 1).padStart(2, "0")}
										</span>

										{hasRating ? (
											<span className={styles.ratingChip}>
												<AiTwotoneStar />
												{rating.toFixed(1)}
											</span>
										) : !released ? (
											<span className="absolute right-2.5 top-2.5 z-[2] rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#ff8a5c] backdrop-blur">
												Coming soon
											</span>
										) : null}

										<div className={styles.cardMeta}>
											<span className={styles.cardMetaTop}>
												<span>{mediaLabel}</span>
												{year ? <span>{year}</span> : null}
											</span>
										</div>
									</div>

									<div className="mt-3 flex flex-col gap-0.5 px-0.5">
										<h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-text-primary transition-colors group-hover:text-primary">
											{movieTitle}
										</h3>
										<p className="line-clamp-1 text-xs text-text-secondary">
											{year || "TBA"} · {mediaLabel}
										</p>
									</div>
								</Link>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
		</section>
	);
};

export default RecommendationContainer;
