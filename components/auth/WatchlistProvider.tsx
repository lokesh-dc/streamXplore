"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useUser } from "@/lib/hooks/useUser";
import {
	getWatchlist as getWatchlistDB,
	toggleWatchlist as toggleWatchlistDB,
	removeFromWatchlist as removeFromWatchlistDB,
	clearWatchlist as clearWatchlistDB,
} from "@/app/actions/watchlist";
import {
	getWatchlist as getWatchlistLS,
	isSaved as isSavedLS,
	toggleSaved as toggleSavedLS,
	removeFromWatchlist as removeFromWatchlistLS,
	clearWatchlist as clearWatchlistLS,
	subscribeWatchlist,
	type WatchlistEntry,
} from "@/lib/watchlist";

type WatchlistContextValue = {
	/** True once the initial load has settled (DB) or immediately (guest). */
	ready: boolean;
	/** Signed-in users get server state; guests fall back to localStorage. */
	signedIn: boolean;
	isSaved: (id: number, mediaType: "movie" | "tv") => boolean;
	toggle: (entry: Omit<WatchlistEntry, "addedAt">) => Promise<boolean>;
	remove: (id: number, mediaType: "movie" | "tv") => Promise<void>;
	clear: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue>({
	ready: false,
	signedIn: false,
	isSaved: () => false,
	toggle: async () => false,
	remove: async () => {},
	clear: async () => {},
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
	const { user, loading } = useUser();
	/** `mediaType-id` keys, kept in memory so lookups never hit the network. */
	const [keys, setKeys] = useState<Set<string>>(() => new Set());
	const [ready, setReady] = useState(false);

	// Signed in: one query loads the whole watchlist, then lookups are local.
	useEffect(() => {
		if (loading) return;
		let cancelled = false;

		if (!user) {
			setKeys(new Set());
			setReady(true);
			return;
		}

		setReady(false);
		(async () => {
			try {
				const rows = await getWatchlistDB();
				if (cancelled) return;
				setKeys(new Set(rows.map((r: any) => `${r.media_type}-${r.tmdb_id}`)));
			} catch {
				/* ignore — leave empty */
			} finally {
				if (!cancelled) setReady(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [user, loading]);

	// Guests: localStorage is synchronous and free, just mirror cross-tab edits.
	useEffect(() => {
		if (loading || user) return;
		const sync = () => {
			setKeys(
				new Set(
					getWatchlistLS().map(
						(e: WatchlistEntry) => `${e.mediaType}-${e.id}`,
					),
				),
			);
		};
		sync();
		return subscribeWatchlist(sync);
	}, [user, loading]);

	const isSaved = useCallback(
		(id: number, mediaType: "movie" | "tv") =>
			keys.has(`${mediaType}-${id}`),
		[keys],
	);

	const toggle = useCallback(
		async (entry: Omit<WatchlistEntry, "addedAt">) => {
			const key = `${entry.mediaType}-${entry.id}`;
			const next = !keys.has(key);

			// Optimistic — flip instantly, reconcile on failure.
			setKeys((prev) => {
				const copy = new Set(prev);
				if (next) copy.add(key);
				else copy.delete(key);
				return copy;
			});

			try {
				if (user) {
					await toggleWatchlistDB({
						mediaType: entry.mediaType,
						tmdbId: entry.id,
						title: entry.title,
						posterPath: entry.posterPath,
					});
				} else if (next) {
					// Guest mode still persists to localStorage.
					toggleSavedLS(entry);
				} else {
					removeFromWatchlistLS(entry.id, entry.mediaType);
				}
				return next;
			} catch (err) {
				// Revert the optimistic flip.
				setKeys((prev) => {
					const copy = new Set(prev);
					if (next) copy.delete(key);
					else copy.add(key);
					return copy;
				});
				console.error(err);
				return keys.has(key);
			}
		},
		[keys, user],
	);

	const remove = useCallback(
		async (id: number, mediaType: "movie" | "tv") => {
			const key = `${mediaType}-${id}`;
			setKeys((prev) => {
				const copy = new Set(prev);
				copy.delete(key);
				return copy;
			});
			if (user) await removeFromWatchlistDB(mediaType, id);
			else removeFromWatchlistLS(id, mediaType);
		},
		[user],
	);

	const clear = useCallback(async () => {
		setKeys(new Set());
		if (user) await clearWatchlistDB();
		else clearWatchlistLS();
	}, [user]);

	const value = useMemo<WatchlistContextValue>(
		() => ({
			ready: loading ? false : ready,
			signedIn: !!user,
			isSaved,
			toggle,
			remove,
			clear,
		}),
		[loading, ready, user, isSaved, toggle, remove, clear],
	);

	return (
		<WatchlistContext.Provider value={value}>
			{children}
		</WatchlistContext.Provider>
	);
}

export const useWatchlist = () => useContext(WatchlistContext);
