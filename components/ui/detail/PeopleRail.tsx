"use client";

import React, { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";
import "swiper/css/free-mode";

import styles from "@/styles/MovieContainer.module.css";
import { getImageBaseLink } from "@/constants";
import { decorateLink } from "@/utils";

export interface PersonCard {
	id: number;
	name: string;
	imagePath?: string | null;
	meta?: string | null;
}

interface PeopleRailProps {
	eyebrow: string;
	title: string;
	countLabel: string;
	people: Array<PersonCard>;
}

const getInitials = (name: string) =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();

const PeopleCard = ({ person }: { person: PersonCard }) => {
	const href = `/person/${decorateLink(person.name)}/${person.id}`;

	return (
		<Link href={href} className="group flex w-28 flex-col sm:w-32">
			<div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[0_18px_34px_-24px_rgba(0,0,0,0.9)] transition-all duration-300 ease-smooth group-hover:border-primary/40 group-hover:shadow-[0_26px_44px_-24px_rgba(0,0,0,0.95)]">
				{person.imagePath ? (
					<Image
						unoptimized
						src={getImageBaseLink({
							type: "profile",
							quality: "md",
							path: person.imagePath,
						})}
						alt={person.name}
						fill
						sizes="128px"
						className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.06]"
					/>
				) : (
					<span className="flex h-full w-full items-center justify-center font-display text-3xl text-text-secondary">
						{getInitials(person.name)}
					</span>
				)}

				{person.meta ? (
					<span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-10 opacity-0 transition-all duration-300 ease-smooth group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(max-width:600px)]:translate-y-0 [@media(max-width:600px)]:opacity-100">
						<span className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-white">
							{person.meta}
						</span>
					</span>
				) : null}
			</div>

			<p className="mt-2.5 truncate px-0.5 text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">
				{person.name}
			</p>
		</Link>
	);
};

const PeopleRail = ({ eyebrow, title, countLabel, people }: PeopleRailProps) => {
	const maskRef = useRef<HTMLDivElement>(null);

	// Fade each edge only when there is content hidden beyond it, so the
	// overlay disappears once the user has reached the start or the end.
	const syncEdges = useCallback((sw: SwiperClass) => {
		const el = maskRef.current;
		if (!el) return;
		const atStart = sw.isBeginning;
		const atEnd = sw.isEnd;
		const left = atStart
			? "#000 0"
			: "transparent 0, #000 var(--shell-pad)";
		const right = atEnd
			? "#000 100%"
			: "#000 calc(100% - var(--shell-pad)), transparent 100%";
		const mask = `linear-gradient(90deg, ${left}, ${right})`;
		el.style.webkitMaskImage = mask;
		el.style.maskImage = mask;
	}, []);

	if (!people?.length) return null;

	return (
		<section className="flex flex-col gap-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex flex-col gap-2">
					<span className="eyebrow">{eyebrow}</span>
					<h2 className="font-display text-2xl leading-none text-text-primary md:text-3xl">
						{title}
					</h2>
				</div>
				<span className="tabular text-xs font-bold text-text-secondary">
					{countLabel}
				</span>
			</header>

			<div ref={maskRef} className="row-mask">
				<Swiper
					slidesPerView="auto"
					spaceBetween={14}
					freeMode={true}
					mousewheel={{
						forceToAxis: true,
						releaseOnEdges: true,
					}}
					modules={[Mousewheel, FreeMode]}
					onSwiper={syncEdges}
					onProgress={syncEdges}
					onSetTranslate={syncEdges}
					onResize={syncEdges}
					onReachBeginning={syncEdges}
					onReachEnd={syncEdges}
					onFromEdge={syncEdges}
					onToEdge={syncEdges}
					onTouchEnd={syncEdges}
					className={`w-full ${styles.swiperContainer} overscroll-x-contain touch-pan-y`}>
					{people.map((person, idx) => (
						<SwiperSlide
							key={person.id ?? `${person.name}-${idx}`}
							className="!w-fit pb-3">
							<PeopleCard person={person} />
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};

export default PeopleRail;
