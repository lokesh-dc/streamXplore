"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

import styles from "@/styles/MovieContainer.module.css";
import { getImageBaseLink } from "@/constants";
import { decorateLink } from "@/utils";

interface CastMember {
	id: number;
	name: string;
	character?: string | null;
	profile_path?: string | null;
}

interface CastSectionProps {
	cast: Array<CastMember>;
}

const getInitials = (name: string) =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();

const CastCard = ({ person }: { person: CastMember }) => {
	const href = `/person/${decorateLink(person.name)}/${person.id}`;

	return (
		<Link href={href} className="group flex w-28 flex-col sm:w-32">
			<div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[0_18px_34px_-24px_rgba(0,0,0,0.9)] transition-all duration-300 ease-smooth group-hover:border-primary/40 group-hover:shadow-[0_26px_44px_-24px_rgba(0,0,0,0.95)]">
				{person.profile_path ? (
					<Image
						unoptimized
						src={getImageBaseLink({
							type: "profile",
							quality: "md",
							path: person.profile_path,
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

				{person.character ? (
					<span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-10 opacity-0 transition-all duration-300 ease-smooth group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(max-width:600px)]:translate-y-0 [@media(max-width:600px)]:opacity-100">
						<span className="line-clamp-2 text-[10.5px] font-semibold leading-tight text-white">
							{person.character}
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

const CastSection = ({ cast }: CastSectionProps) => {
	if (!cast?.length) return null;

	return (
		<section className="flex flex-col gap-5">
			<header className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex flex-col gap-2">
					<span className="eyebrow">Top billed</span>
					<h2 className="font-display text-2xl leading-none text-text-primary md:text-3xl">
						Cast
					</h2>
				</div>
				<span className="tabular text-xs font-bold text-text-secondary">
					{cast.length} {cast.length === 1 ? "credit" : "credits"}
				</span>
			</header>

			<div className="">
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
					{cast.map((person, idx) => (
						<SwiperSlide
							key={person.id ?? `${person.name}-${idx}`}
							className="!w-fit pb-3">
							<CastCard person={person} />
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};

export default CastSection;