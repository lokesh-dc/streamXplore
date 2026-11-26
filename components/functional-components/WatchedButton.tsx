"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { BsCheckCircle, BsCheckCircleFill } from "react-icons/bs";
import { isWatched, subscribeWatched, toggleWatched } from "@/lib/watched";
import { useUser } from "@/lib/hooks/useUser";
import { isWatchedTitle, toggleWatchedTitle } from "@/app/actions/watched";

interface WatchedButtonProps {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath?: string | null;
	className?: string;
	showLabel?: boolean;
}

/**
 * Toggles the current title as watched.
 * Works seamlessly with localStorage for instant feedback & offline/guest use,
 * and syncs with Supabase when signed in.
 */
export default function WatchedButton({
	id,
	mediaType,
	title,
	posterPath = null,
	className,
	showLabel = true,
}: WatchedButtonProps) {
	const [watched, setWatched] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [busy, setBusy] = useState(false);
	const { user, loading } = useUser();

	useEffect(() => {
		setMounted(true);
		setWatched(isWatched(id, mediaType));
	}, [id, mediaType]);

	// Sync state: DB if signed in, localStorage otherwise.
	useEffect(() => {
		if (loading) return;
		let cancelled = false;

		const sync = async () => {
			if (user) {
				try {
					const res = await isWatchedTitle(mediaType, id);
					if (!cancelled) setWatched(res);
				} catch {
					if (!cancelled) setWatched(isWatched(id, mediaType));
				}
			} else if (!cancelled) {
				setWatched(isWatched(id, mediaType));
			}
		};

		sync();
		return () => {
			cancelled = true;
		};
	}, [id, mediaType, user, loading]);

	// Listen to local changes (across tabs / other components)
	useEffect(() => {
		const sync = () => setWatched(isWatched(id, mediaType));
		return subscribeWatched(sync);
	}, [id, mediaType]);

	const handleClick = async () => {
		if (busy) return;
		setBusy(true);

		// Instantly update local state for reactive UX
		const nextState = toggleWatched({
			id,
			mediaType,
			title,
			posterPath,
		});
		setWatched(nextState);

		if (user) {
			try {
				await toggleWatchedTitle({
					mediaType,
					tmdbId: id,
					title,
					posterPath,
				});
			} catch (err) {
				console.error("Failed to sync watched status to account:", err);
			}
		}

		setBusy(false);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-pressed={watched}
			disabled={busy}
			title={
				watched
					? "Mark as unwatched"
					: "Mark as watched"
			}
			className={clsx(
				"inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md border px-5 text-base font-medium transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50",
				watched
					? "border-emerald-500/50 bg-emerald-500/15 text-white hover:bg-emerald-500/25"
					: "border-white/20 text-white hover:bg-white/10",
				className,
			)}
		>
			{watched ? (
				<BsCheckCircleFill className="text-emerald-400 text-lg" />
			) : (
				<BsCheckCircle className="text-lg text-white/70" />
			)}
			{showLabel && (
				<span aria-live={mounted ? "polite" : undefined}>
					{watched ? "Watched" : "Mark as watched"}
				</span>
			)}
		</button>
	);
}
