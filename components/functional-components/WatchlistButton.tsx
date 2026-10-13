"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { isSaved, subscribeWatchlist, toggleSaved } from "@/lib/watchlist";

interface WatchlistButtonProps {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath?: string | null;
	className?: string;
	showLabel?: boolean;
}

/**
 * Toggles the current title in the localStorage-backed watchlist.
 * Hydration-safe: reads storage only after mount.
 */
export default function WatchlistButton({
	id,
	mediaType,
	title,
	posterPath = null,
	className,
	showLabel = true,
}: WatchlistButtonProps) {
	const [saved, setSaved] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const sync = () => setSaved(isSaved(id, mediaType));
		sync();
		return subscribeWatchlist(sync);
	}, [id, mediaType]);

	const handleClick = () => {
		setSaved(toggleSaved({ id, mediaType, title, posterPath }));
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={saved}
			title={saved ? "Remove from watchlist" : "Add to watchlist"}
			className={clsx(
				"inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-base font-medium transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50",
				saved
					? "border-primary/50 bg-primary/15 text-white hover:bg-primary/25"
					: "border-white/20 text-white hover:bg-white/10",
				className,
			)}
		>
			{saved ? (
				<BsBookmarkFill className="text-primary" />
			) : (
				<BsBookmark />
			)}
			{showLabel && (
				<span aria-live={mounted ? "polite" : undefined}>
					{saved ? "Saved" : "Watchlist"}
				</span>
			)}
		</button>
	);
}
