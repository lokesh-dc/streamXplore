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

/**
 * Formats a clean, readable display name from a username, metadata, or query string.
 * Strips email suffixes (@...), dots/underscores, trailing punctuation,
 * and any appended promotional share text (e.g. "Check out ...", "'s shared list").
 */
export function formatCleanDisplayName(raw?: string | null): string {
	if (!raw) return "";
	let s = decodeURIComponent(raw).trim();

	// Strip concatenated promotional text if present
	if (s.includes("Check out")) {
		s = s.split("Check out")[0].trim();
	}
	if (s.toLowerCase().includes("'s shared list")) {
		s = s.split(/'s shared list/i)[0].trim();
	}
	if (s.toLowerCase().includes("shared list")) {
		s = s.split(/shared list/i)[0].trim();
	}
	if (s.toLowerCase().includes("hookedonmovies")) {
		s = s.split(/hookedonmovies/i)[0].trim();
	}
	// Strip email domain if an email was passed
	if (s.includes("@")) {
		s = s.split("@")[0].trim();
	}
	// If dotted or underscored username (e.g., "lokesh.cdewanand" -> "Lokesh")
	if (s.includes(".") || s.includes("_")) {
		const firstPart = s.split(/[._]/)[0].trim();
		if (firstPart.length >= 2) {
			s = firstPart;
		}
	}
	// Strip trailing non-alphanumeric characters
	s = s.replace(/[^a-zA-Z0-9\s]+$/, "").trim();

	// Capitalize first letter
	if (s.length > 0) {
		s = s.charAt(0).toUpperCase() + s.slice(1);
	}
	return s;
}

/**
 * Compact URL sharing: encodes only media type prefix ('m' | 't') and ID.
 * Example: [{ id: 550, mediaType: 'movie' }, { id: 1399, mediaType: 'tv' }] -> "m550,t1399"
 * No titles, descriptions, or image URLs in the URL!
 */
export function encodeSharedIds(items: Array<{ id: number; mediaType: "movie" | "tv" }>): string {
	return items.map((i) => `${i.mediaType === "movie" ? "m" : "t"}${i.id}`).join(",");
}

export function decodeSharedIds(str: string): Array<{ id: number; mediaType: "movie" | "tv" }> {
	if (!str) return [];
	return str
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => {
			const type = part[0]?.toLowerCase() === "t" ? ("tv" as const) : ("movie" as const);
			const id = parseInt(part.slice(1), 10);
			return isNaN(id) ? null : { id, mediaType: type };
		})
		.filter((item): item is { id: number; mediaType: "movie" | "tv" } => item !== null);
}

/** Legacy compact base64 encoding/decoding kept for backward compatibility. */
export function encodeSharedWatched(items: WatchedEntry[], userName?: string): string {
	return encodeSharedIds(items);
}

export function decodeSharedWatched(encoded: string): { name: string; items: WatchedEntry[] } | null {
	try {
		let json = "";
		if (typeof Buffer !== "undefined") {
			json = Buffer.from(encoded, "base64url").toString("utf-8");
		} else {
			json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
		}
		const parsed = JSON.parse(json);
		if (!parsed || !Array.isArray(parsed.items)) return null;
		return {
			name: parsed.name || "Friend",
			items: parsed.items.map((item: any[]) => ({
				id: Number(item[0]),
				mediaType: item[1] === 1 ? ("movie" as const) : ("tv" as const),
				title: String(item[2]),
				posterPath: item[3] ? String(item[3]) : null,
				addedAt: Date.now(),
			})),
		};
	} catch {
		return null;
	}
}

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
