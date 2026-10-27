import getMethod from "@/utils/methods/get";

export interface WatchProvider {
	provider_id: number;
	provider_name: string;
	logo_path: string | null;
	display_priority: number;
}

export interface WatchRegion {
	iso_3166_1: string;
	english_name: string;
	native_name: string;
}

const priorityOf = (provider: any): number =>
	typeof provider?.display_priority === "number"
		? provider.display_priority
		: Number.MAX_SAFE_INTEGER;

/**
 * Providers differ slightly between movie and TV catalogues, so merge both
 * lists and keep the best regional display priority for each provider.
 */
export async function getWatchProviders(
	region: string,
): Promise<WatchProvider[]> {
	const [movies, tv] = await Promise.all([
		getMethod({
			path: "/watch/providers/movie",
			params: { watch_region: region },
		}),
		getMethod({
			path: "/watch/providers/tv",
			params: { watch_region: region },
		}),
	]);

	const merged = new Map<number, WatchProvider>();

	for (const provider of [
		...(Array.isArray(movies.data) ? movies.data : []),
		...(Array.isArray(tv.data) ? tv.data : []),
	]) {
		if (!provider?.provider_id || !provider?.provider_name) continue;

		const next: WatchProvider = {
			provider_id: provider.provider_id,
			provider_name: provider.provider_name,
			logo_path: provider.logo_path || null,
			display_priority: priorityOf(provider),
		};

		const existing = merged.get(next.provider_id);
		if (!existing || next.display_priority < existing.display_priority) {
			merged.set(next.provider_id, next);
		}
	}

	return Array.from(merged.values()).sort(
		(a, b) =>
			a.display_priority - b.display_priority ||
			a.provider_name.localeCompare(b.provider_name),
	);
}

export async function getWatchProviderRegions(): Promise<WatchRegion[]> {
	const response = await getMethod({
		path: "/watch/providers/regions",
		props: { next: { revalidate: 86400 } },
	});

	if (!Array.isArray(response.data)) return [];

	return [...response.data].sort((a, b) =>
		String(a.english_name).localeCompare(String(b.english_name)),
	);
}
