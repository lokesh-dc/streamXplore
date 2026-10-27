"use client";

import { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useWatchlist } from "@/components/auth/WatchlistProvider";

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
 * Reads from the shared WatchlistProvider — no per-card network request.
 */
export default function CompactWatchlistButton({
	id,
	mediaType,
	title,
	posterPath = null,
	className,
}: CompactWatchlistButtonProps) {
	const [busy, setBusy] = useState(false);
	const { ready, signedIn, isSaved, toggle } = useWatchlist();
	const router = useRouter();

	const saved = ready && isSaved(id, mediaType);

	const handleClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (busy || !ready) return;
		if (!signedIn) {
			router.push("/login");
			return;
		}
		setBusy(true);
		try {
			await toggle({ id, mediaType, title, posterPath });
		} finally {
			setBusy(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={saved}
			disabled={busy || !ready}
			aria-label={saved ? `Remove ${title} from watchlist` : `Save ${title} to watchlist`}
			title={
				!signedIn
					? "Sign in to save to your watchlist"
					: saved
						? "Remove from watchlist"
						: "Save to watchlist"
			}
			className={clsx(
				"absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-sm backdrop-blur transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60 [@media(hover:none)]:opacity-100",
				saved
					? "border-primary/60 bg-primary text-white opacity-100 hover:bg-primary/90"
					: "border-white/15 bg-black/70 text-white opacity-0 hover:bg-primary hover:text-white group-hover:opacity-100",
				className,
			)}>
			{saved ? <BsBookmarkFill /> : <BsBookmark />}
		</button>
	);
}
