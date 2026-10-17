"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { isSaved, subscribeWatchlist, toggleSaved } from "@/lib/watchlist";

interface CompactWatchlistButtonProps {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath?: string | null;
	className?: string;
}

/**
 * Icon-only watchlist toggle for overlaying on cards.
 * Render as a sibling of the card link (not nested inside it).
 * Hydration-safe: reads storage only after mount.
 */
export default function CompactWatchlistButton({
	id,
	mediaType,
	title,
	posterPath = null,
	className,
}: CompactWatchlistButtonProps) {
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const sync = () => setSaved(isSaved(id, mediaType));
		sync();
		return subscribeWatchlist(sync);
	}, [id, mediaType]);

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setSaved(toggleSaved({ id, mediaType, title, posterPath }));
			}}
			aria-pressed={saved}
			aria-label={saved ? `Remove ${title} from watchlist` : `Save ${title} to watchlist`}
			title={saved ? "Remove from watchlist" : "Save to watchlist"}
			className={clsx(
				"absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-sm backdrop-blur transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [@media(hover:none)]:opacity-100",
				saved
					? "border-primary/60 bg-primary text-white opacity-100 hover:bg-primary/90"
					: "border-white/15 bg-black/70 text-white opacity-0 hover:bg-primary hover:text-white group-hover:opacity-100",
				className,
			)}>
			{saved ? <BsBookmarkFill /> : <BsBookmark />}
		</button>
	);
}
