"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import HorizontalSlider from "@/components/ui/HorizontalSlider";
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
		<Link
			href={href}
			draggable={false}
			className="group flex w-28 select-none flex-col sm:w-32">
			<div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[0_18px_34px_-24px_rgba(0,0,0,0.9)] transition-all duration-300 ease-smooth group-hover:border-primary/40 group-hover:shadow-[0_26px_44px_-24px_rgba(0,0,0,0.95)]">
				{person.imagePath ? (
					<Image
						unoptimized
						loading="lazy"
						decoding="async"
						draggable={false}
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

			<HorizontalSlider gap={14} itemClassName="pb-3" ariaLabel={title}>
				{people.map((person, idx) => (
					<PeopleCard
						key={person.id ?? `${person.name}-${idx}`}
						person={person}
					/>
				))}
			</HorizontalSlider>
		</section>
	);
};

export default PeopleRail;
