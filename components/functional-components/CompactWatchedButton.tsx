"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { FiCheck } from "react-icons/fi";
import {
	isWatched,
	subscribeFollowing,
	toggleWatched,
} from "@/lib/following";

interface CompactWatchedButtonProps {
	personId: number;
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	className?: string;
}

/**
 * Icon-only watched toggle for overlaying on cards.
 * Render as a sibling of the card link (not nested inside it).
 * Hydration-safe: reads storage only after mount.
 */
export default function CompactWatchedButton({
	personId,
	id,
	mediaType,
	title,
	className,
}: CompactWatchedButtonProps) {
	const [watched, setWatched] = useState(false);

	useEffect(() => {
		const sync = () => setWatched(isWatched(personId, mediaType, id));
		sync();
		return subscribeFollowing(sync);
	}, [personId, mediaType, id]);

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setWatched(toggleWatched(personId, mediaType, id));
			}}
			aria-pressed={watched}
			aria-label={
				watched ? `Mark ${title} as unwatched` : `Mark ${title} as watched`
			}
			title={watched ? "Watched — click to undo" : "Mark as watched"}
			className={clsx(
				"absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-sm backdrop-blur transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [@media(hover:none)]:opacity-100",
				watched
					? "border-primary/60 bg-primary text-white opacity-100 hover:bg-primary/90"
					: "border-white/15 bg-black/70 text-white opacity-0 hover:bg-primary hover:text-white group-hover:opacity-100",
				className,
			)}>
			<FiCheck strokeWidth={3} />
		</button>
	);
}
