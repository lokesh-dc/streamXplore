/** Client-side watched titles store persisted to localStorage. */

const WATCHED_KEY = "hookedonmovies:watched";
export const WATCHED_EVENT = "hookedonmovies:watched";

export interface WatchedEntry {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath: string | null;
	addedAt: number;
}

const read = (): WatchedEntry[] => {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(WATCHED_KEY);
		return raw ? (JSON.parse(raw) as WatchedEntry[]) : [];
	} catch {
		return [];
	}
};

const emit = () => {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(WATCHED_EVENT));
};

const write = (list: WatchedEntry[]) => {
	try {
		localStorage.setItem(WATCHED_KEY, JSON.stringify(list));
	} catch {
		/* storage unavailable — ignore */
	}
	emit();
};

export const getWatchedTitles = read;

export const isWatched = (id: number, mediaType: "movie" | "tv"): boolean =>
	read().some((entry) => entry.id === id && entry.mediaType === mediaType);

/** Toggle a title in the watched list. Returns true if it is now watched. */
export const toggleWatched = (
	entry: Omit<WatchedEntry, "addedAt">
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

export const removeFromWatched = (
	id: number,
	mediaType: "movie" | "tv"
): void => {
	write(read().filter((e) => !(e.id === id && e.mediaType === mediaType)));
};

export const clearWatched = (): void => write([]);

/** Subscribe to watched changes (same-tab event + cross-tab storage event). */
export const subscribeWatched = (callback: () => void): (() => void) => {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(WATCHED_EVENT, callback);
	window.addEventListener("storage", callback);
	return () => {
		window.removeEventListener(WATCHED_EVENT, callback);
		window.removeEventListener("storage", callback);
	};
};
