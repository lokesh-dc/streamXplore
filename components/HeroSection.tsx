"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper";
import type { Swiper as SwiperClass } from "swiper/types";

import "swiper/css";
import "swiper/css/effect-fade";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getImageBaseLink } from "@/constants";
import { movieDetails } from "@/constants/typescript";
import { decorateLink } from "@/utils";
import { motionTokens } from "@/lib/motion";
import { Button } from "./buttons";

import { AiTwotoneStar } from "react-icons/ai";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";

import styles from "@/styles/HeroSection.module.css";

interface props {
	data: Array<movieDetails> | null | undefined;
}

const formatCount = (value?: number | null) => {
	if (!value) return null;
	if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
	return `${value}`;
};

const heroMotion: Variants = {
	initial: { opacity: 0, y: 26 },
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: motionTokens.durations.slow,
			ease: motionTokens.easings.smooth,
		},
	},
	exit: {
		opacity: 0,
		y: -14,
		transition: { duration: motionTokens.durations.normal },
	},
};

const HeroSection = ({ data }: props) => {
	const router = useRouter();
	const swiperRef = useRef<SwiperClass | null>(null);
	const [active, setActive] = useState(0);

	if (!data || !data.length) return null;

	const total = data.length;
	const item = data[Math.min(active, total - 1)] || data[0];
	const title = item?.title || item?.name || "";
	const mediaType = item?.media_type || (item?.title ? "movie" : "tv");
	const mediaLabel = mediaType === "tv" ? "Series" : "Film";
	const year = (item?.release_date || item?.first_air_date)?.split("-")[0];
	const votes = formatCount(item?.vote_count);
	const genres = (item?.genres || []).filter((g) => g?.name).slice(0, 3);

	const openDetails = () =>
		router.push(`/${mediaType}/${decorateLink(title)}/${item?.id}`);

	const goTo = (index: number) => swiperRef.current?.slideToLoop(index);

	return (
		<section className={styles.hero} aria-roledescription="carousel">
			<Swiper
				modules={[Autoplay, EffectFade, Navigation]}
				effect="fade"
				fadeEffect={{ crossFade: true }}
				speed={900}
				loop
				allowTouchMove={false}
				autoplay={{
					delay: 10000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true,
				}}
				onSwiper={(swiper: SwiperClass) => {
					swiperRef.current = swiper;
				}}
				onSlideChange={(swiper: SwiperClass) => setActive(swiper.realIndex)}
				className={styles.heroSwiper}>
				{data.map((slide, index) => {
					const slideTitle = slide?.title || slide?.name || "";
					return (
						<SwiperSlide key={`${slide?.id ?? "slide"}-${index}`}>
							<div className={styles.media}>
								<Image
									unoptimized
									fill
									priority={index === 0}
									sizes="100vw"
									src={getImageBaseLink({
										type: "backdrop",
										quality: "lg",
										path: slide?.backdrop_path || slide?.poster_path,
									})}
									alt={`${slideTitle} backdrop`}
									className={styles.backdrop}
								/>
							</div>
						</SwiperSlide>
					);
				})}
			</Swiper>

			<div className={styles.scrim} aria-hidden="true" />

			<div className={`shell ${styles.overlay}`}>
				<div className={styles.stage}>
					<AnimatePresence mode="wait">
						<motion.div
							key={active}
							initial="initial"
							animate="animate"
							exit="exit"
							variants={heroMotion}
							className={styles.stageInner}>
							<div className={styles.copy}>
								<span className={`eyebrow ${styles.kicker}`}>
									<span className={styles.pulse} aria-hidden="true" />
									Trending today · #{String(active + 1).padStart(2, "0")}
								</span>

								<h1 className={`font-display text-balance ${styles.title}`}>
									{title}
								</h1>

								<div className={styles.meta}>
									{item?.vote_average ? (
										<span className={styles.metaStrong}>
											<AiTwotoneStar className="text-accent" />
											<span className="tabular">
												{item.vote_average.toFixed(1)}
											</span>
										</span>
									) : null}
									{year ? <span>{year}</span> : null}
									<span>{mediaLabel}</span>
									{votes ? <span>{votes} votes</span> : null}
								</div>

								{item?.overview ? (
									<p className={styles.overview}>{item.overview}</p>
								) : null}

								{genres.length ? (
									<div className={styles.genres}>
										{genres.map((genre) => (
											<button
												key={genre.id}
												type="button"
												onClick={() =>
													router.push(
														`/${mediaType === "tv" ? "tv-series" : "movies"}?genre=${genre.id}`,
													)
												}
												className={styles.genre}>
												{genre.name}
											</button>
										))}
									</div>
								) : null}

								<div className={styles.actions}>
									<Button
										size="lg"
										rightIcon={<FaArrowRight />}
										onClick={openDetails}>
										More info
									</Button>
									<Button
										size="lg"
										variant="ghost"
										onClick={() =>
											router.push(mediaType === "tv" ? "/tv-series" : "/movies")
										}>
										Browse {mediaType === "tv" ? "series" : "films"}
									</Button>
								</div>
							</div>

							<button
								type="button"
								onClick={openDetails}
								className={styles.posterCard}
								aria-label={`Open ${title}`}>
								<Image
									unoptimized
									fill
									sizes="(min-width: 1024px) 260px, 0px"
									src={getImageBaseLink({
										type: "poster",
										quality: "lg",
										path: item?.poster_path || item?.backdrop_path,
									})}
									alt={`${title} poster`}
									className={styles.posterImage}
								/>
								{item?.vote_average ? (
									<span className={styles.posterBadge}>
										<AiTwotoneStar />
										{item.vote_average.toFixed(1)}
									</span>
								) : null}
							</button>
						</motion.div>
					</AnimatePresence>
				</div>

				<div className={styles.controls}>
					<span className={`eyebrow tabular ${styles.counter}`}>
						{String(active + 1).padStart(2, "0")}
						<span className={styles.counterDivider} />
						{String(total).padStart(2, "0")}
					</span>

					<div
						className={styles.progress}
						role="tablist"
						aria-label="Select featured title">
						{data.map((slide, index) => (
							<button
								key={`tab-${slide?.id ?? index}-${index}`}
								type="button"
								role="tab"
								aria-selected={index === active}
								aria-label={`Go to slide ${index + 1}`}
								onClick={() => goTo(index)}
								className={`${styles.progressSeg} ${
									index === active ? styles.progressSegActive : ""
								}`}>
								<span />
							</button>
						))}
					</div>

					<div className={styles.nav}>
						<button
							type="button"
							className={styles.navBtn}
							aria-label="Previous"
							onClick={() => swiperRef.current?.slidePrev()}>
							<FaChevronLeft />
						</button>
						<button
							type="button"
							className={styles.navBtn}
							aria-label="Next"
							onClick={() => swiperRef.current?.slideNext()}>
							<FaChevronRight />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
