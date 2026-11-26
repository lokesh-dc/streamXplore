"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiTrash2, FiX, FiCheck, FiShare2, FiSearch, FiExternalLink } from "react-icons/fi";
import { BsCheckCircle, BsCheckCircleFill } from "react-icons/bs";
import { IoShareSocialOutline } from "react-icons/io5";

import {
	clearWatched as clearWatchedLS,
	getWatchedTitles,
	removeFromWatched as removeFromWatchedLS,
	subscribeWatched,
	encodeSharedIds,
	formatCleanDisplayName,
	type WatchedEntry,
} from "@/lib/watched";
import { useUser } from "@/lib/hooks/useUser";
import {
	getWatchedTitles as getWatchedTitlesDB,
	removeFromWatchedTitle as removeFromWatchedDB,
	clearWatchedTitles as clearWatchedDB,
	resolveSharedTitles,
} from "@/app/actions/watched";
import MovieCard from "@/components/cards/MovieCard";

type Filter = "all" | "movie" | "tv";
type SortOrder = "recent" | "alpha";

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

export interface WatchedViewProps {
	initialEntries?: WatchedEntry[];
	isSharedView?: boolean;
	sharedOwnerName?: string;
	listParam?: string;
}

const WatchedView: React.FC<WatchedViewProps> = ({
	initialEntries = [],
	isSharedView = false,
	sharedOwnerName,
	listParam,
}) => {
	const [entries, setEntries] = useState<WatchedEntry[]>(initialEntries);
	const [mounted, setMounted] = useState(false);
	const [isInitialLoading, setIsInitialLoading] = useState(
		!isSharedView && initialEntries.length === 0,
	);
	const [filter, setFilter] = useState<Filter>("all");
	const [query, setQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOrder>("recent");
	const [copied, setCopied] = useState(false);
	const { user, loading } = useUser();

	useEffect(() => {
		setMounted(true);
		if (isSharedView) {
			if (initialEntries.length > 0) {
				setEntries(initialEntries);
				setIsInitialLoading(false);
			} else if (listParam) {
				setIsInitialLoading(true);
				resolveSharedTitles(listParam)
					.then((resolved) => {
						setEntries(resolved);
					})
					.catch(() => {
						setEntries([]);
					})
					.finally(() => {
						setIsInitialLoading(false);
					});
			} else {
				setEntries([]);
				setIsInitialLoading(false);
			}
			return;
		}
		if (typeof window !== "undefined" && !user && !initialEntries.length) {
			const local = [...getWatchedTitles()].sort((a, b) => b.addedAt - a.addedAt);
			setEntries(local);
			setIsInitialLoading(false);
		}
	}, [isSharedView, initialEntries, listParam, user]);

	useEffect(() => {
		if (isSharedView || loading) return;
		let cancelled = false;

		const sync = async () => {
			const localItems = [...getWatchedTitles()].sort((a, b) => b.addedAt - a.addedAt);

			if (user) {
				try {
					const rows = await getWatchedTitlesDB();
					if (cancelled) return;
					const dbItems: WatchedEntry[] = (rows || []).map((r: any) => ({
						id: r.tmdb_id,
						mediaType: r.media_type,
						title: r.title,
						posterPath: r.poster_path,
						addedAt: new Date(r.added_at).getTime() || 0,
					}));

					// Combine DB items and local items to guarantee titles are never lost/empty
					const map = new Map<string, WatchedEntry>();
					dbItems.forEach((item) => map.set(`${item.mediaType}-${item.id}`, item));
					localItems.forEach((item) => {
						const key = `${item.mediaType}-${item.id}`;
						if (!map.has(key)) map.set(key, item);
					});

					const merged = Array.from(map.values()).sort((a, b) => b.addedAt - a.addedAt);
					setEntries(merged);
				} catch {
					if (!cancelled) setEntries(localItems);
				} finally {
					if (!cancelled) setIsInitialLoading(false);
				}
			} else if (!cancelled) {
				setEntries(localItems);
				setIsInitialLoading(false);
			}
		};
		sync();
		return () => {
			cancelled = true;
		};
	}, [user, loading, isSharedView]);

	// Listen for local changes across tabs when viewing own list
	useEffect(() => {
		if (isSharedView || user || loading) return;
		const sync = () =>
			setEntries([...getWatchedTitles()].sort((a, b) => b.addedAt - a.addedAt));
		return subscribeWatched(sync);
	}, [user, loading, isSharedView]);

	useEffect(() => {
		if (!copied) return;
		const t = setTimeout(() => setCopied(false), 2400);
		return () => clearTimeout(t);
	}, [copied]);

	const counts = useMemo(
		() => ({
			all: entries.length,
			movie: entries.filter((e) => e.mediaType === "movie").length,
			tv: entries.filter((e) => e.mediaType === "tv").length,
		}),
		[entries],
	);

	const visible = useMemo(() => {
		let list = filter === "all" ? entries : entries.filter((e) => e.mediaType === filter);
		if (query.trim()) {
			const q = query.trim().toLowerCase();
			list = list.filter((e) => e.title.toLowerCase().includes(q));
		}
		if (sortBy === "alpha") {
			return [...list].sort((a, b) => a.title.localeCompare(b.title));
		}
		return [...list].sort((a, b) => b.addedAt - a.addedAt);
	}, [entries, filter, query, sortBy]);

	const handleRemove = async (entry: WatchedEntry) => {
		if (isSharedView) return;
		if (user) {
			await removeFromWatchedDB(entry.mediaType, entry.id);
			setEntries((prev) =>
				prev.filter(
					(e) => !(e.id === entry.id && e.mediaType === entry.mediaType),
				),
			);
		} else {
			removeFromWatchedLS(entry.id, entry.mediaType);
		}
	};

	const handleClear = async () => {
		if (isSharedView) return;
		if (
			typeof window !== "undefined" &&
			!window.confirm("Are you sure you want to clear your entire watched history?")
		) {
			return;
		}

		if (user) {
			await clearWatchedDB();
			setEntries([]);
		} else {
			clearWatchedLS();
		}
	};

	const handleShare = async () => {
		if (typeof window === "undefined" || !entries.length) return;
		const rawName =
			user?.user_metadata?.full_name ||
			(user?.email ? user.email.split("@")[0] : "") ||
			"";
		const cleanName = formatCleanDisplayName(rawName);

		const listIds = encodeSharedIds(entries);
		const nameQuery = cleanName ? `&name=${encodeURIComponent(cleanName)}` : "";

		// Clean URL: only short IDs (e.g. list=m550,t1399) and optional clean name.
		// NO whole titles, descriptions, or email strings in the URL!
		const shareUrl = `${window.location.origin}/watched?list=${listIds}${nameQuery}`;
		const shareTitle = cleanName ? `${cleanName}'s Shared List` : "Shared List";

		if (navigator?.share) {
			try {
				await navigator.share({
					title: shareTitle,
					url: shareUrl,
				});
				return;
			} catch (err: any) {
				if (err.name !== "AbortError") {
					console.error("Native share error:", err);
				}
			}
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
		} catch {
			/* clipboard unavailable */
		}
	};

	if (!mounted || (loading && !entries.length) || (isInitialLoading && !entries.length)) {
		return <Skeleton />;
	}

	return (
		<>
			{/* Shared collection alert banner */}
			{isSharedView ? (
				<div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 md:flex-row md:items-center">
					<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
							<BsCheckCircleFill className="text-xl" />
						</span>
						<div>
							<h3 className="font-semibold text-white">
								{sharedOwnerName ? `${sharedOwnerName}'s Shared List` : "Shared List"}
							</h3>
							<p className="text-xs text-text-secondary">
								Publicly shared collection ({entries.length} {entries.length === 1 ? "title" : "titles"})
							</p>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={handleShare}
							className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10">
							{copied ? <FiCheck className="text-primary text-sm" /> : <FiShare2 className="text-sm" />}
							{copied ? "Link Copied" : "Share"}
						</button>
						<Link
							href="/movies"
							className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90">
							Build Your Own
						</Link>
					</div>
				</div>
			) : null}

			{/* Empty state */}
			{!entries.length ? (
				<div className="flex flex-col items-center gap-5 py-20 text-center">
					<span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-text-secondary">
						<BsCheckCircle />
					</span>
					<h2 className="font-display text-4xl leading-none md:text-5xl">
						{isSharedView ? "This shared list is empty" : "No watched titles yet"}
					</h2>
					<p className="max-w-sm text-sm leading-relaxed text-text-secondary">
						{isSharedView
							? "Looks like no films or series have been added to this list."
							: "Mark any film or series as watched on its page, and it will be tracked here for your completion runs."}
					</p>
					<div className="mt-1 flex flex-wrap items-center justify-center gap-3">
						<Link
							href="/movies"
							className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
							Browse movies
						</Link>
						<Link
							href="/tv-series"
							className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
							Browse series
						</Link>
					</div>
				</div>
			) : (
				<>
					{/* Controls bar: Type Filters, Search, Sort & Action Buttons */}
					<div className="mb-8 flex flex-col gap-4">
						<div className="flex flex-wrap items-center justify-between gap-4">
							{/* Filter tabs */}
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
													? "border-emerald-500/50 bg-emerald-500/15 text-white"
													: "border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary"
											}`}>
											{tab.label}
											<span className="tabular opacity-60">{counts[tab.id]}</span>
										</button>
									);
								})}
							</div>

							{/* Actions: Share & Clear */}
							<div className="flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={handleShare}
									title="Share your watched list with friends"
									className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-text-primary transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
									{copied ? (
										<FiCheck className="text-sm text-emerald-400" />
									) : (
										<IoShareSocialOutline className="text-base text-primary" />
									)}
									<span>{copied ? "Link Copied!" : "Share List"}</span>
								</button>

								{!isSharedView ? (
									<button
										type="button"
										onClick={handleClear}
										className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:border-red-500/40 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
										<FiTrash2 className="text-sm" />
										<span>Clear all</span>
									</button>
								) : null}
							</div>
						</div>

						{/* Search & Sort secondary bar */}
						<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
							<div className="relative min-w-[240px] flex-1 max-w-md">
								<FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-secondary" />
								<input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search watched titles..."
									className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-xs text-white placeholder-text-secondary/60 focus:border-primary/50 focus:outline-none"
								/>
								{query ? (
									<button
										type="button"
										onClick={() => setQuery("")}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-white">
										<FiX />
									</button>
								) : null}
							</div>

							<div className="flex items-center gap-2 text-xs text-text-secondary">
								<span>Sort:</span>
								<button
									type="button"
									onClick={() => setSortBy(sortBy === "recent" ? "alpha" : "recent")}
									className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-text-primary transition-colors hover:border-white/20">
									{sortBy === "recent" ? "Recently added" : "Title (A–Z)"}
								</button>
							</div>
						</div>
					</div>

					{/* Grid of Movie/Series Cards */}
					{visible.length ? (
						<div className={GRID}>
							{visible.map((entry) => (
								<motion.article
									key={`${entry.mediaType}-${entry.id}`}
									layout
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									className="group relative flex flex-col">
									{!isSharedView ? (
										<button
											type="button"
											onClick={() => handleRemove(entry)}
											aria-label={`Remove ${entry.title} from watched`}
											title="Remove from watched"
											className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white opacity-0 backdrop-blur transition-all duration-200 ease-smooth hover:bg-red-600 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 [@media(hover:none)]:opacity-100">
											<FiX className="text-sm" />
										</button>
									) : null}

									{/* Watched confirmation badge */}
									<span className="absolute left-2 top-2 z-20 flex h-7 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-black/80 px-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur">
										<BsCheckCircleFill className="text-xs" />
										<span>Watched</span>
									</span>

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
							No titles match your search or filter.
						</p>
					)}
				</>
			)}
		</>
	);
};

export default WatchedView;
