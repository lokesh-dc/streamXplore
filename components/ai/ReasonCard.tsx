"use client";

import Image from "next/image";
import Link from "next/link";
import { getImageBaseLink } from "@/constants";
import { decorateLink, isReleased } from "@/utils";
import type { AiPick } from "@/lib/ai/types";
import { AiFillStar } from "react-icons/ai";

interface ReasonCardProps {
	pick: AiPick;
	active?: boolean;
	onSelect?: () => void;
}

/** Compact poster + match-reason card for the curated shortlist. */
const ReasonCard = ({ pick, active = false, onSelect }: ReasonCardProps) => {
	const link = `/${pick.mediaType}/${decorateLink(pick.title)}/${pick.id}`;

	const body = (
		<div className="group w-28 sm:w-36 flex-shrink-0 text-left">
			<div
				className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 ${
					active
						? "border-[#E6501B] ring-2 ring-[#E6501B]/40 shadow-[0_0_24px_rgba(230,80,27,0.35)]"
						: "border-white/10 group-hover:border-white/30"
				}`}>
				{pick.posterPath || pick.backdropPath ? (
					<Image
						unoptimized
						src={getImageBaseLink({
							type: pick.posterPath ? "poster" : "backdrop",
							quality: "md",
							path: pick.posterPath || pick.backdropPath,
						})}
						alt={pick.title}
						fill
						sizes="144px"
						className={`object-cover transition-transform duration-500 ${active ? "scale-105" : "group-hover:scale-105"}`}
					/>
				) : null}
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
{isReleased(pick) ? (
					typeof pick.voteAverage === "number" && (
						<span className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white">
							<AiFillStar className="text-[#F5C518]" />
							{pick.voteAverage.toFixed(1)}
						</span>
					)
				) : (
					<span className="absolute top-1.5 right-1.5 text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-md bg-[#E6501B] text-white">
						Coming Soon
					</span>
				)}
				<span className="absolute top-1.5 left-1.5 bg-white/90 text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
					{pick.mediaType === "tv" ? "TV" : "Film"}
				</span>
				<div className="absolute inset-x-0 bottom-0 p-2">
					<p className="text-[11px] leading-tight font-bold text-white truncate">
						{pick.title}
					</p>
					<p className="text-[10px] leading-snug text-white/70 line-clamp-2 mt-0.5">
						{pick.reason}
					</p>
				</div>
			</div>
		</div>
	);

	if (onSelect) {
		return (
			<button type="button" onClick={onSelect} aria-label={pick.title}>
				{body}
			</button>
		);
	}

	return (
		<Link prefetch={false} href={link} aria-label={pick.title}>
			{body}
		</Link>
	);
};

export default ReasonCard;