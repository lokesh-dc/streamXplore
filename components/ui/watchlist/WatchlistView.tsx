"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiTrash2, FiX } from "react-icons/fi";
import { BsBookmark } from "react-icons/bs";

import {
	clearWatchlist,
	getWatchlist,
	removeFromWatchlist,
	subscribeWatchlist,
	type WatchlistEntry,
} from "@/lib/watchlist";
import MovieCard from "@/components/cards/MovieCard";

type Filter = "all" | "movie" | "tv";

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "movie", label: "Movies" },
	{ id: "tv", label: "Series" },
];

const GRID =
	"grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5";

const Skeleton = () => (
	<div className={GRID}>
		{Array.from({ length: 10 }).map((_, i) => (
			<div key={i} className="animate-pulse">
				<div className="aspect-[2/3] w-full rounded-xl bg-white/[0.05]" />
				<div className="mt-3 h-3 w-4/5 rounded-full bg-white/[0.05]" />
				<div className="mt-2 h-3 w-1/3 rounded-full bg-white/[0.05]" />
			</div>
		))}
	</div>
);

const WatchlistView = () => {
	const [entries, setEntries] = useState<WatchlistEntry[]>([]);
	const [mounted, setMounted] = useState(false);
	const [filter, setFilter] = useState<Filter>("all");

	useEffect(() => {
		setMounted(true);
		const sync = () =>
			setEntries([...getWatchlist()].sort((a, b) => b.addedAt - a.addedAt));
		sync();
		return subscribeWatchlist(sync);
	}, []);

	const counts = useMemo(
		() => ({
			all: entries.length,
			movie: entries.filter((e) => e.mediaType === "movie").length,
			tv: entries.filter((e) => e.mediaType === "tv").length,
		}),
		[entries],
	);

	const visible =
		filter === "all" ? entries : entries.filter((e) => e.mediaType === filter);

	const handleRemove = (entry: WatchlistEntry) =>
		removeFromWatchlist(entry.id, entry.mediaType);

	if (!mounted) return <Skeleton />;

	if (!entries.length) {
		return (
			<div className="flex flex-col items-center gap-5 py-20 text-center">
				<span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-text-secondary">
					<BsBookmark />
				</span>
				<h2 className="font-display text-4xl leading-none md:text-5xl">
					Your watchlist is empty
				</h2>
				<p className="max-w-sm text-sm leading-relaxed text-text-secondary">
					Tap the watchlist button on any film or series to save it here for
					later.
				</p>
				<div className="mt-1 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/movies"
						className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
						Browse movies
					</Link>
					<Link
						href="/recommendations"
						className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
						Ask Hooked AI
					</Link>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-2">
					{FILTERS.map((tab) => {
						const active = filter === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setFilter(tab.id)}
								aria-pressed={active}
								className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
									active
										? "border-primary/50 bg-primary/15 text-white"
										: "border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary"
								}`}>
								{tab.label}
								<span className="tabular opacity-60">{counts[tab.id]}</span>
							</button>
						);
					})}
				</div>

				<button
					type="button"
					onClick={() => clearWatchlist()}
					className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:border-red-500/40 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
					<FiTrash2 className="text-sm" />
					Clear all
				</button>
			</div>

			{visible.length ? (
				<div className={GRID}>
					{visible.map((entry) => (
						<motion.article
							key={`${entry.mediaType}-${entry.id}`}
							layout
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							className="group relative flex flex-col">
							<button
								type="button"
								onClick={() => handleRemove(entry)}
								aria-label={`Remove ${entry.title} from watchlist`}
								title="Remove from watchlist"
								className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white opacity-0 backdrop-blur transition-all duration-200 ease-smooth hover:bg-primary hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 [@media(hover:none)]:opacity-100">
								<FiX className="text-sm" />
							</button>

							<MovieCard
								imgSrc={entry.posterPath}
								title={entry.title}
								movieId={entry.id}
								showType={entry.mediaType}
							/>

							<div className="mt-3 flex flex-col gap-1">
								<h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-text-primary">
									{entry.title}
								</h3>
								<span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
									{entry.mediaType === "tv" ? "Series" : "Film"}
								</span>
							</div>
						</motion.article>
					))}
				</div>
			) : (
				<p className="py-16 text-center text-sm text-text-secondary">
					Nothing saved in this category yet.
				</p>
			)}
		</>
	);
};

export default WatchlistView;
