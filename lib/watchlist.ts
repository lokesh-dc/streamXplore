/** Client-side watchlist persisted to localStorage (no backend involved). */

const WATCHLIST_KEY = "hookedonmovies:watchlist";

export interface WatchlistEntry {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath: string | null;
	addedAt: number;
}

const read = (): WatchlistEntry[] => {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(WATCHLIST_KEY);
		return raw ? (JSON.parse(raw) as WatchlistEntry[]) : [];
	} catch {
		return [];
	}
};

const write = (list: WatchlistEntry[]) => {
	try {
		localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
	} catch {
		/* storage unavailable — ignore */
	}
};

export const getWatchlist = read;

export const isSaved = (id: number, mediaType: "movie" | "tv"): boolean =>
	read().some((entry) => entry.id === id && entry.mediaType === mediaType);

/** Toggle a title in the watchlist. Returns true if it is now saved. */
export const toggleSaved = (
	entry: Omit<WatchlistEntry, "addedAt">
): boolean => {
	const list = read();
	const exists = list.some(
		(e) => e.id === entry.id && e.mediaType === entry.mediaType
	);
	const next = exists
		? list.filter((e) => !(e.id === entry.id && e.mediaType === entry.mediaType))
		: [...list, { ...entry, addedAt: Date.now() }];
	write(next);
	return !exists;
};