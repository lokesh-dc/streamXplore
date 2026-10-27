/** Client-side "following" store for people (cast/directors) + per-person watched progress. */

const FOLLOWING_KEY = "hookedonmovies:following";
const TRACKED_KEY = "hookedonmovies:tracked";
export const FOLLOWING_EVENT = "hookedonmovies:following";

export interface FollowedPerson {
	id: number;
	name: string;
	profilePath: string | null;
	department: string | null;
	addedAt: number;
}

/** Storage shape for watched titles: personId -> ["movie-123", "tv-456"] */
type TrackedMap = Record<string, string[]>;

export const titleKey = (mediaType: "movie" | "tv", id: number) =>
	`${mediaType}-${id}`;

const readFollowing = (): FollowedPerson[] => {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(FOLLOWING_KEY);
		return raw ? (JSON.parse(raw) as FollowedPerson[]) : [];
	} catch {
		return [];
	}
};

const readTracked = (): TrackedMap => {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(TRACKED_KEY);
		return raw ? (JSON.parse(raw) as TrackedMap) : {};
	} catch {
		return {};
	}
};

const emit = () => {
	if (typeof window !== "undefined")
		window.dispatchEvent(new Event(FOLLOWING_EVENT));
};

const writeFollowing = (list: FollowedPerson[]) => {
	try {
		localStorage.setItem(FOLLOWING_KEY, JSON.stringify(list));
	} catch {
		/* storage unavailable — ignore */
	}
	emit();
};

const writeTracked = (map: TrackedMap) => {
	try {
		localStorage.setItem(TRACKED_KEY, JSON.stringify(map));
	} catch {
		/* storage unavailable — ignore */
	}
	emit();
};

export const getFollowed = readFollowing;

export const isFollowing = (id: number): boolean =>
	readFollowing().some((p) => p.id === id);

/** Toggle a person in the following list. Returns true if now followed. */
export const toggleFollow = (
	entry: Omit<FollowedPerson, "addedAt">,
): boolean => {
	const list = readFollowing();
	const exists = list.some((p) => p.id === entry.id);
	const next = exists
		? list.filter((p) => p.id !== entry.id)
		: [...list, { ...entry, addedAt: Date.now() }];
	writeFollowing(next);
	return !exists;
};

export const removeFollowed = (id: number): void => {
	writeFollowing(readFollowing().filter((p) => p.id !== id));
};

export const clearFollowed = (): void => writeFollowing([]);

/** Watched helpers (per-person filmography checklist). */

export const getWatchedForPerson = (personId: number): string[] =>
	readTracked()[String(personId)] ?? [];

export const isWatched = (
	personId: number,
	mediaType: "movie" | "tv",
	titleId: number,
): boolean =>
	getWatchedForPerson(personId).includes(titleKey(mediaType, titleId));

/** Toggle a single title as watched for a person. Returns true if now watched. */
export const toggleWatched = (
	personId: number,
	mediaType: "movie" | "tv",
	titleId: number,
): boolean => {
	const map = readTracked();
	const pid = String(personId);
	const key = titleKey(mediaType, titleId);
	const current = new Set(map[pid] ?? []);
	const nowWatched = !current.has(key);
	if (nowWatched) current.add(key);
	else current.delete(key);
	writeTracked({ ...map, [pid]: Array.from(current) });
	return nowWatched;
};

export const setAllWatched = (
	personId: number,
	keys: string[],
): void => {
	const map = readTracked();
	writeTracked({ ...map, [String(personId)]: keys });
};

export const clearWatchedForPerson = (personId: number): void => {
	const map = readTracked();
	delete map[String(personId)];
	writeTracked({ ...map });
};

/** Subscribe to following/tracked changes (same-tab event + cross-tab storage). */
export const subscribeFollowing = (callback: () => void): (() => void) => {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(FOLLOWING_EVENT, callback);
	window.addEventListener("storage", callback);
	return () => {
		window.removeEventListener(FOLLOWING_EVENT, callback);
		window.removeEventListener("storage", callback);
	};
};
