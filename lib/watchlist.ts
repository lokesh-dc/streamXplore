/** Client-side watchlist persisted to localStorage (no backend involved). */

const WATCHLIST_KEY = "hookedonmovies:watchlist";
export const WATCHLIST_EVENT = "hookedonmovies:watchlist";

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

const emit = () => {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(WATCHLIST_EVENT));
};

const write = (list: WatchlistEntry[]) => {
	try {
		localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
	} catch {
		/* storage unavailable — ignore */
	}
	emit();
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

export const removeFromWatchlist = (
	id: number,
	mediaType: "movie" | "tv"
): void => {
	write(read().filter((e) => !(e.id === id && e.mediaType === mediaType)));
};

export const clearWatchlist = (): void => write([]);

/** Subscribe to watchlist changes (same-tab event + cross-tab storage event). */
export const subscribeWatchlist = (callback: () => void): (() => void) => {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(WATCHLIST_EVENT, callback);
	window.addEventListener("storage", callback);
	return () => {
		window.removeEventListener(WATCHLIST_EVENT, callback);
		window.removeEventListener("storage", callback);
	};
};