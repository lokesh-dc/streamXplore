import getTrendingMovies from "./trendingMovies";
import getTrendingSeries from "./trendingSeries";

export type AuthVisual = {
	backdrop: string | null;
	posters: { src: string; title: string }[];
};

type TmdbItem = {
	backdrop_path?: string | null;
	poster_path?: string | null;
	title?: string;
	name?: string;
};

/**
 * Artwork for the split-panel auth screens (login / signup).
 * One real trending backdrop for the left panel, plus a short shelf of
 * posters underneath. Movies and series are merged so the shelf mixes both.
 * The getters never reject, so this degrades to an empty visual on failure.
 */
export default async function getAuthVisuals(): Promise<AuthVisual> {
	const [movies, series] = await Promise.all([
		getTrendingMovies(),
		getTrendingSeries(),
	]);

	const pool: TmdbItem[] = [
		...(((movies as any)?.data as TmdbItem[]) || []),
		...(((series as any)?.data as TmdbItem[]) || []),
	].filter(Boolean);

	const backdrop =
		pool.find((item) => item?.backdrop_path)?.backdrop_path || null;

	const posters = pool
		.filter((item) => item?.poster_path)
		.slice(0, 6)
		.map((item) => ({
			src: item.poster_path as string,
			title: item.title || item.name || "Trending title",
		}));

	return { backdrop, posters };
}
