"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { AiFillStar, AiTwotoneStar } from "react-icons/ai";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

import styles from "@/styles/MovieContainer.module.css";
import { getImageBaseLink } from "@/constants";
import { personDetails } from "@/constants/typescript";
import { decorateLink, isReleased } from "@/utils";

type CreditItem = {
	mediaType: "movie" | "tv";
	id: number;
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	date: string | null;
	year: string | null;
	rating: number;
	voteCount: number;
	overview: string | null;
	role: "cast" | "crew";
	character: string | null;
	job: string | null;
	department: string | null;
	episodeCount: number | null;
};

const getInitials = (name: string) =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();

const formatDate = (date?: string | null) => {
	if (!date) return null;
	const d = new Date(`${date}T00:00:00`);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const getAge = (birthday?: string | null, at?: string | null) => {
	if (!birthday) return null;
	const birth = new Date(`${birthday}T00:00:00`);
	if (Number.isNaN(birth.getTime())) return null;
	const end = at ? new Date(`${at}T00:00:00`) : new Date();
	if (Number.isNaN(end.getTime())) return null;
	let age = end.getFullYear() - birth.getFullYear();
	const endM = end.getMonth();
	const birthM = birth.getMonth();
	if (endM < birthM || (endM === birthM && end.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age;
};

const genderLabel = (gender: number) =>
	gender === 1 ? "Female" : gender === 2 ? "Male" : gender === 3 ? "Non-binary" : "—";

const JOB_PRIORITY = [
	"Director",
	"Creator",
	"Writer",
	"Screenplay",
	"Story",
	"Producer",
	"Executive Producer",
	"Director of Photography",
	"Original Music Composer",
	"Editor",
	"Casting",
];

const jobRank = (job: string | null) => {
	if (!job) return JOB_PRIORITY.length;
	const index = JOB_PRIORITY.indexOf(job);
	return index === -1 ? JOB_PRIORITY.length : index;
};

const dedupeCredits = (items: CreditItem[]): CreditItem[] => {
	const groups = new Map<string, CreditItem[]>();

	for (const item of items) {
		const key = `${item.mediaType}-${item.id}`;
		const group = groups.get(key);
		if (group) group.push(item);
		else groups.set(key, [item]);
	}

	const merged: CreditItem[] = [];

	for (const group of Array.from(groups.values())) {
		if (group.length === 1) {
			merged.push(group[0]);
			continue;
		}

		const cast = group.find((c) => c.role === "cast");
		const crew = group
			.filter((c) => c.role === "crew" && c.job)
			.sort((a, b) => jobRank(a.job) - jobRank(b.job))[0];

		const base = cast || crew || group[0];
		const pick = <T,>(selector: (c: CreditItem) => T | null | undefined) =>
			group.map(selector).find((value) => value != null) ?? selector(base);

		merged.push({
			...base,
			role: cast ? "cast" : "crew",
			character: pick((c) => c.character) ?? null,
			job: pick((c) => c.job) ?? null,
			department: pick((c) => c.department) ?? null,
			posterPath: pick((c) => c.posterPath) ?? null,
			backdropPath: pick((c) => c.backdropPath) ?? null,
			overview: pick((c) => c.overview) ?? null,
			date: pick((c) => c.date) ?? null,
			year: pick((c) => c.year) ?? null,
			rating: Math.max(...group.map((c) => c.rating)),
			voteCount: Math.max(...group.map((c) => c.voteCount)),
			episodeCount: Math.max(...group.map((c) => c.episodeCount || 0)) || null,
		});
	}

	return merged;
};

const normalizeCredits = (data: personDetails) => {
	const films: CreditItem[] = [];
	const series: CreditItem[] = [];

	const pushMedia = (
		mediaType: "movie" | "tv",
		item: any,
		role: "cast" | "crew",
	) => {
		const title = item.title || item.name;
		if (!title) return;
		const date = item.release_date || item.first_air_date || null;
		const entry: CreditItem = {
			mediaType,
			id: item.id,
			title,
			posterPath: item.poster_path || null,
			backdropPath: item.backdrop_path || null,
			date,
			year: date ? date.slice(0, 4) : null,
			rating: typeof item.vote_average === "number" ? item.vote_average : 0,
			voteCount: typeof item.vote_count === "number" ? item.vote_count : 0,
			overview: item.overview || null,
			role,
			character: item.character || null,
			job: item.job || null,
			department: item.department || null,
			episodeCount:
				typeof item.episode_count === "number" ? item.episode_count : null,
		};
		(mediaType === "movie" ? films : series).push(entry);
	};

	(data.movie_credits?.cast || []).forEach((c: any) =>
		pushMedia("movie", c, "cast"),
	);
	(data.movie_credits?.crew || []).forEach((c: any) =>
		pushMedia("movie", c, "crew"),
	);
	(data.tv_credits?.cast || []).forEach((c: any) =>
		pushMedia("tv", c, "cast"),
	);
	(data.tv_credits?.crew || []).forEach((c: any) =>
		pushMedia("tv", c, "crew"),
	);

	const sortDesc = (a: CreditItem, b: CreditItem) => {
		if (a.date && b.date) return b.date.localeCompare(a.date);
		if (a.date) return -1;
		if (b.date) return 1;
		return b.voteCount - a.voteCount;
	};

	return {
		films: dedupeCredits(films).sort(sortDesc),
		series: dedupeCredits(series).sort(sortDesc),
	};
};

const buildKnownFor = (
	data: personDetails,
	films: CreditItem[],
	series: CreditItem[],
) => {
	const voteWeight = (c: CreditItem) =>
		c.voteCount > 0 ? c.rating * Math.log10(c.voteCount + 1) : 0;
	const all = [...films, ...series]
		.filter((c) => c.posterPath && c.voteCount > 0)
		.sort((a, b) => voteWeight(b) - voteWeight(a) || b.rating - a.rating);
	const seen = new Set<string>();
	const picks: CreditItem[] = [];
	for (const c of all) {
		const key = `${c.mediaType}-${c.id}`;
		if (seen.has(key)) continue;
		seen.add(key);
		picks.push(c);
		if (picks.length === 12) break;
	}
	return picks;
};

const ratingOf = (c: CreditItem) =>
	isReleased({ release_date: c.date, first_air_date: c.date }) &&
		c.rating > 0
		? c.rating
		: null;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
	<h3 className="font-display text-2xl leading-none text-text-primary md:text-3xl">
		{children}
	</h3>
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

const CreditCard = ({ credit }: { credit: CreditItem }) => {
	const href = `/${credit.mediaType}/${decorateLink(credit.title)}/${credit.id}`;
	const rating = ratingOf(credit);
	const poster = credit.posterPath
		? getImageBaseLink({
			type: "poster",
			quality: "md",
			path: credit.posterPath,
		})
		: null;

	let roleLine: React.ReactNode = null;
	if (credit.role === "crew") {
		roleLine = (
			<span className="shrink-0 rounded-sm bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-secondary">
				{credit.job || credit.department || "Crew"}
			</span>
		);
	} else if (credit.character) {
		roleLine = (
			<span className="min-w-0 truncate text-text-secondary">
				As <span className="text-text-primary">{credit.character}</span>
			</span>
		);
	}

	return (
		<li className="group">
			<Link href={href} className="block">
				<div className={styles.card}>
					<div className={styles.cardImage}>
						{poster ? (
							<Image
								unoptimized
								fill
								sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
								src={poster}
								alt={`${credit.title} poster`}
								className={styles.cardImg}
							/>
						) : (
							<span className="flex h-full w-full items-center justify-center font-display text-3xl text-text-secondary">
								{getInitials(credit.title)}
							</span>
						)}
					</div>
					{rating ? (
						<span className={styles.ratingChip}>
							<AiTwotoneStar />
							{rating.toFixed(1)}
						</span>
					) : null}
				</div>

				<div className="mt-2.5 flex flex-col gap-0.5 px-0.5">
					<h4 className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-primary">
						{credit.title}
					</h4>
					<p className="flex items-center gap-x-1.5 text-xs text-text-secondary">
						<span className="tabular shrink-0">{credit.year || "TBA"}</span>
						{roleLine ? (
							<>
								<span
									aria-hidden
									className="h-0.5 w-0.5 shrink-0 rounded-full bg-white/30"
								/>
								{roleLine}
							</>
						) : null}
						{credit.episodeCount ? (
							<>
								<span
									aria-hidden
									className="h-0.5 w-0.5 shrink-0 rounded-full bg-white/30"
								/>
								<span className="tabular shrink-0">
									{credit.episodeCount} eps
								</span>
							</>
						) : null}
					</p>
				</div>
			</Link>
		</li>
	);
};

const CreditSection = ({
	eyebrow,
	title,
	count,
	credits,
}: {
	eyebrow: string;
	title: string;
	count: number;
	credits: CreditItem[];
}) => (
	<section>
		<header className="mb-4 flex flex-wrap items-end justify-between gap-3">
			<div className="flex flex-col gap-1.5">
				<span className="eyebrow">{eyebrow}</span>
				<SectionTitle>{title}</SectionTitle>
			</div>
			<span className="tabular text-xs font-bold text-text-secondary">
				{count} {count === 1 ? "credit" : "credits"}
			</span>
		</header>
		{count ? (
			<ol className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{credits.map((credit, i) => (
					<CreditCard key={`${credit.mediaType}-${credit.id}-${i}`} credit={credit} />
				))}
			</ol>
		) : (
			<p className="text-sm text-text-secondary">No credits to show.</p>
		)}
	</section>
);

const PersonDetail: React.FC<{ data: personDetails }> = ({ data }) => {
	const [bioExpanded, setBioExpanded] = useState(false);

	const { films, series } = useMemo(() => normalizeCredits(data), [data]);
	const knownFor = useMemo(() => buildKnownFor(data, films, series), [data, films, series]);
	const totalCredits = films.length + series.length;

	const name = data.name || "Unknown";
	const initials = getInitials(name);
	const age = getAge(data.birthday);
	const birthLabel = formatDate(data.birthday);
	const deathLabel = formatDate(data.deathday);

	const profile_url = data.profile_path
		? getImageBaseLink({ type: "profile", quality: "lg", path: data.profile_path })
		: null;

	// Cinematic backdrop: borrow the strongest known credit's artwork,
	// falling back to the profile portrait as a dimmed wash.
	const backdropCredit =
		[...films, ...series].find(
			(c) => c.backdropPath && c.voteCount > 0,
		) || [...films, ...series].find((c) => c.backdropPath);

	const backdrop_url = backdropCredit?.backdropPath
		? getImageBaseLink({
			type: "backdrop",
			quality: "md",
			path: backdropCredit.backdropPath,
		})
		: profile_url;

	const heroBackdrop = backdrop_url ? (
		<Image
			unoptimized
			src={backdrop_url}
			alt=""
			fill
			priority
			sizes="100vw"
			className="object-cover object-top opacity-50"
		/>
	) : null;

	const knownTitles = knownFor.slice(0, 4).map((c) => c.title).join(", ");
	const crewJobs = new Set(
		[...films, ...series]
			.filter((c) => c.role === "crew" && c.job)
			.map((c) => c.job as string),
	);

	const imdbLink = data.external_ids?.imdb_id
		? `https://www.imdb.com/name/${data.external_ids.imdb_id}`
		: null;

	return (
		<div className="relative min-h-screen font-sans text-text-primary">
			{/* Cinematic backdrop */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] min-h-[520px] overflow-hidden">
				{heroBackdrop}
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
					<span className="max-w-[34ch] truncate text-text-primary/70">
						{name}
					</span>
				</nav>

				<div className="flex max-w-4xl flex-col gap-5">
					<span className="eyebrow">
						Talent
						{data.known_for_department
							? ` · ${data.known_for_department}`
							: ""}
					</span>

					<h1 className="text-balance font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.9] text-text-primary">
						{name}
					</h1>

					{knownTitles ? (
						<p className="max-w-2xl text-base font-medium text-text-secondary sm:text-lg">
							Known for{" "}
							<span className="text-text-primary">{knownTitles}</span>
						</p>
					) : null}

					<div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-text-secondary">
						{birthLabel ? (
							<span>
								Born {birthLabel}
								{age != null ? (
									<>
										{" "}
										<span className="text-text-primary">
											({age}
											{deathLabel ? `–${getAge(data.birthday, data.deathday)}` : ""})
										</span>
									</>
								) : null}
							</span>
						) : null}
						{data.place_of_birth ? (
							<>
								<span aria-hidden className="h-1 w-1 rounded-full bg-white/25" />
								<span>{data.place_of_birth}</span>
							</>
						) : null}
						{totalCredits ? (
							<>
								<span aria-hidden className="h-1 w-1 rounded-full bg-white/25" />
								<span className="tabular">
									{totalCredits} credits
								</span>
							</>
						) : null}
						{crewJobs.size ? (
							<>
								<span aria-hidden className="h-1 w-1 rounded-full bg-white/25" />
								<span>Also {Array.from(crewJobs).slice(0, 3).join(", ")}</span>
							</>
						) : null}
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="shell relative z-10 grid gap-12 pb-24 pt-4 lg:grid-cols-[320px_1fr] lg:gap-16">
				<aside className="flex flex-col gap-8 self-start lg:sticky lg:top-[calc(var(--nav-h,72px)_+_2rem)]">
					<div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-2xl">
						{profile_url ? (
							<Image
								unoptimized
								src={profile_url}
								alt={`${name} portrait`}
								width={632}
								height={948}
								className="h-auto w-full object-cover"
							/>
						) : (
							<div className="flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-b from-white/10 to-transparent">
								<span className="font-display text-8xl text-text-secondary">
									{initials}
								</span>
							</div>
						)}
						<span className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
							{data.known_for_department || "Talent"}
						</span>
					</div>

					<dl className="flex flex-col text-sm">
						<InfoRow label="Known for" value={data.known_for_department || "—"} />
						<InfoRow
							label="Gender"
							value={genderLabel(data.gender)}
						/>
						{birthLabel ? (
							<InfoRow
								label="Born"
								value={
									deathLabel
										? `${birthLabel} – ${deathLabel}`
										: birthLabel
								}
							/>
						) : null}
						{data.place_of_birth ? (
							<InfoRow label="Place of birth" value={data.place_of_birth} />
						) : null}
						<InfoRow
							label="Popularity"
							value={data.popularity ? `${Math.round(data.popularity)}` : "—"}
						/>
						{imdbLink ? (
							<InfoRow
								label="IMDb"
								value={
									<a
										href={imdbLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary transition-colors hover:text-primary/80">
										View profile ↗
									</a>
								}
							/>
						) : null}
						{data.homepage ? (
							<InfoRow
								label="Homepage"
								value={
									<a
										href={data.homepage}
										target="_blank"
										rel="noopener noreferrer"
										className="max-w-[16ch] truncate text-primary transition-colors hover:text-primary/80">
										Visit ↗
									</a>
								}
							/>
						) : null}
						{data.also_known_as?.length ? (
							<InfoRow
								label="Also known as"
								value={data.also_known_as.slice(0, 3).join(", ")}
							/>
						) : null}
					</dl>
				</aside>

				<div className="flex min-w-0 flex-col gap-16">
					{data.biography ? (
						<section className="flex flex-col gap-4">
							<SectionTitle>Biography</SectionTitle>
							<p
								className={`max-w-3xl text-[0.9375rem] leading-relaxed text-text-secondary ${!bioExpanded ? "line-clamp-6" : ""
									}`}>
								{data.biography}
							</p>
							<button
								type="button"
								onClick={() => setBioExpanded((v) => !v)}
								className="w-fit text-xs font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80">
								{bioExpanded ? "Show less" : "Read more"}
							</button>
						</section>
					) : null}

					{knownFor.length ? (
						<section className="flex flex-col gap-5">
							<header className="flex flex-col gap-1.5">
								<span className="eyebrow">Highlights</span>
								<SectionTitle>Known for</SectionTitle>
							</header>
							<div className="">
								<Swiper
									slidesPerView="auto"
									spaceBetween={16}
									freeMode={true}
									mousewheel={{
										forceToAxis: true,
										releaseOnEdges: true,
									}}
									modules={[Mousewheel, FreeMode]}
									className={`w-full ${styles.swiperContainer} overscroll-x-contain touch-pan-y`}>
									{knownFor.map((item) => (
										<SwiperSlide key={item.id} className="!w-fit pb-2">
											<Link
												href={`/${item.mediaType}/${decorateLink(item.title)}/${item.id}`}
												className="group inline-block align-top">
												<div className={`${styles.scroll_card} relative`}>
													<div className={styles.cardImage}>
														<Image
															unoptimized
															width={500}
															height={750}
															src={getImageBaseLink({
																path: item.posterPath,
																type: "poster",
																quality: "lg",
															})}
															alt={`${item.title} poster`}
															className={styles.cardImg}
														/>
													</div>
													{ratingOf(item) ? (
														<span className={styles.ratingChip}>
															<AiTwotoneStar />
															{item.rating.toFixed(1)}
														</span>
													) : null}
												</div>
												<div className="mt-3 flex flex-col gap-0.5 px-0.5">
													<h4 className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-primary">
														{item.title}
													</h4>
													<p className="text-xs text-text-secondary">
														{item.year || "TBA"} ·{" "}
														{item.mediaType === "tv" ? "Series" : "Film"}
													</p>
												</div>
											</Link>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
						</section>
					) : null}

					<div className="flex flex-col gap-16">
						<CreditSection
							eyebrow="Filmography"
							title="Films"
							count={films.length}
							credits={films}
						/>
						<CreditSection
							eyebrow="Filmography"
							title="Series"
							count={series.length}
							credits={series}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PersonDetail;