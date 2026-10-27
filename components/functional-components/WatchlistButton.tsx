"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { isSaved, subscribeWatchlist, toggleSaved } from "@/lib/watchlist";
import { useUser } from "@/lib/hooks/useUser";
import { isInWatchlist, toggleWatchlist } from "@/app/actions/watchlist";

interface WatchlistButtonProps {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath?: string | null;
	className?: string;
	showLabel?: boolean;
}

/**
 * Toggles the current title in the watchlist.
 * Uses Supabase when signed in, falls back to localStorage otherwise.
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
	const [busy, setBusy] = useState(false);
	const { user, loading } = useUser();
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Load state: DB when signed in, localStorage otherwise.
	useEffect(() => {
		if (loading) return;
		let cancelled = false;

		const sync = async () => {
			if (user) {
				try {
					const res = await isInWatchlist(mediaType, id);
					if (!cancelled) setSaved(res);
				} catch {
					/* ignore */
				}
			} else if (!cancelled) {
				setSaved(isSaved(id, mediaType));
			}
		};
		sync();
		return () => { cancelled = true; };
	}, [id, mediaType, user, loading]);

	// Cross-tab updates only apply to the localStorage mode.
	useEffect(() => {
		if (user || loading) return;
		const sync = () => setSaved(isSaved(id, mediaType));
		return subscribeWatchlist(sync);
	}, [id, mediaType, user, loading]);

	const handleClick = async () => {
		if (busy) return;
		if (!user) {
			router.push("/login");
			return;
		}
		setBusy(true);
		try {
			await toggleWatchlist({
				mediaType,
				tmdbId: id,
				title,
				posterPath,
			});
			setSaved(await isInWatchlist(mediaType, id));
		} catch (err) {
			console.error(err);
		} finally {
			setBusy(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={saved}
			disabled={busy}
			title={
				!user
					? "Sign in to save to your watchlist"
					: saved
						? "Remove from watchlist"
						: "Add to watchlist"
			}
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
