import { tool, zodSchema } from "ai";
import { z } from "zod";

import getMethod from "@/utils/methods/get";
import searchMulti from "@/dataFetchings/searchMulti";
import getMovieDetails from "@/dataFetchings/getMovieDetails";
import getTvSeriesDetails from "@/dataFetchings/getTVSeriesDetails";
import { resolveMovieGenreIds, resolveTvGenreIds } from "./tmdb-context";

const SORT_OPTIONS = [
	"popularity.desc",
	"popularity.asc",
	"vote_average.desc",
	"vote_average.asc",
	"primary_release_date.desc",
	"release_date.desc",
	"first_air_date.desc",
	"revenue.desc",
] as const;

const MOVIE_SORTS = new Set([
	"popularity.desc",
	"popularity.asc",
	"vote_average.desc",
	"vote_average.asc",
	"primary_release_date.desc",
	"release_date.desc",
	"revenue.desc",
]);

const TV_SORTS = new Set([
	"popularity.desc",
	"popularity.asc",
	"vote_average.desc",
	"vote_average.asc",
	"first_air_date.desc",
]);

export interface ToolResultItem {
	id: number;
	title: string | null;
	mediaType: "movie" | "tv";
	year: string | null;
	voteAverage: number | null;
	overview: string | null;
	posterPath: string | null;
	backdropPath: string | null;
}

/** Normalize a mixed TMDB results list into a compact, model-friendly shape. */
const normalizeResults = (
	items: any[],
	defaultMediaType: "movie" | "tv"
): ToolResultItem[] => {
	return (items || []).map((item) => {
		const mediaType: "movie" | "tv" =
			item.media_type === "movie" || item.media_type === "tv"
				? item.media_type
				: defaultMediaType;

		return {
			id: item.id,
			title: item.title || item.name || null,
			mediaType,
			year: (item.release_date || item.first_air_date || "").split("-")[0] || null,
			voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
			overview: item.overview || null,
			posterPath: item.poster_path || null,
			backdropPath: item.backdrop_path || null,
		};
	});
};

/** Resolve free-text keyword names to TMDB keyword IDs via /search/keyword. */
const resolveKeywordIds = async (keywords: string[]): Promise<number[]> => {
	if (!keywords?.length) return [];
	const ids: number[] = [];
	for (const keyword of keywords) {
		const result = await getMethod({
			path: "/search/keyword",
			params: { query: keyword },
		});
		const topHit = result.data?.[0];
		if (topHit?.id) ids.push(topHit.id);
	}
	return ids;
};

const SearchCatalogSchema = z.object({
	query: z
		.string()
		.describe(
			"The movie or TV show title, or a short natural-language description of what to find."
		),
	page: z.number().int().min(1).max(5).optional().describe("Results page. Defaults to 1."),
});

const DiscoverMoviesSchema = z.object({
	genres: z
		.array(z.string())
		.optional()
		.describe(
			"Canonical movie genre names from the accepted list. Only use accepted genre names."
		),
	keywords: z
		.array(z.string())
		.optional()
		.describe("Topic keywords to narrow the results, e.g. ['heist', 'time travel']."),
	year_gte: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.optional()
		.describe("Earliest release year (inclusive)."),
	year_lte: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.optional()
		.describe("Latest release year (inclusive)."),
	vote_min: z
		.number()
		.min(0)
		.max(10)
		.optional()
		.describe("Minimum vote average / rating floor."),
	sort_by: z.enum(SORT_OPTIONS).optional().describe("How to order the results."),
	page: z.number().int().min(1).max(5).optional().describe("Results page. Defaults to 1."),
});

const DiscoverTvSchema = z.object({
	genres: z
		.array(z.string())
		.optional()
		.describe(
			"Canonical TV genre names from the accepted list. Only use accepted genre names."
		),
	year_gte: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.optional()
		.describe("Earliest first-air year (inclusive)."),
	year_lte: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.optional()
		.describe("Latest first-air year (inclusive)."),
	vote_min: z
		.number()
		.min(0)
		.max(10)
		.optional()
		.describe("Minimum vote average / rating floor."),
	sort_by: z.enum(SORT_OPTIONS).optional().describe("How to order the results."),
	page: z.number().int().min(1).max(5).optional().describe("Results page. Defaults to 1."),
});

const FetchPostersEntrySchema = z.object({
	title: z
		.string()
		.describe("The movie or TV show title the AI is already recommending."),
	mediaType: z
		.enum(["movie", "tv"])
		.optional()
		.describe("Hint to fetch the right media type when the title is ambiguous."),
	year: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.optional()
		.describe("Hint to fetch the right release entry when the title is ambiguous."),
});

const FetchPostersSchema = z.object({
	titles: z
		.array(FetchPostersEntrySchema)
		.min(1)
		.max(12)
		.describe(
			"The titles the AI has already decided to recommend. Each is looked up in TMDB only to fetch its poster and detail link."
		),
});

const GetTitleDetailsSchema = z.object({
	title: z
		.string()
		.describe("The name of the movie or TV show to look up."),
	mediaType: z
		.enum(["movie", "tv"])
		.describe("Whether the title is a movie or a TV series."),
	year: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.optional()
		.describe("Release or first-air year hint when the title is ambiguous."),
});

/** Search TMDB for a single title and pick the best available match. */
const findBestMatch = async (
	entry: { title: string; mediaType?: "movie" | "tv"; year?: number }
): Promise<ToolResultItem | null> => {
	const result = await searchMulti(entry.title, 1);
	const candidates = (result.data || []).filter(
		(item: any) =>
			!entry.mediaType || item.media_type === entry.mediaType
	);

	const scored: { item: any; score: number }[] = candidates.map((item: any) => {
		const itemYear = (item.release_date || item.first_air_date || "").split("-")[0];
		let score = 0;
		if (entry.year && itemYear && Number(itemYear) === entry.year) score += 2;
		if (entry.mediaType && item.media_type === entry.mediaType) score += 1;
		return { item, score };
	});
	scored.sort((a, b) => b.score - a.score);

	const best = scored[0]?.item;
	if (!best) return null;

	return normalizeResults([best], entry.mediaType || "movie")[0];
};

/** Resolve a title to a TMDB id and fetch its live detail metadata. */
const getTitleDetails = async (entry: {
	title: string;
	mediaType: "movie" | "tv";
	year?: number;
}) => {
	const match = await findBestMatch(entry);
	if (!match) return { found: false, title: entry.title, mediaType: entry.mediaType };

	if (entry.mediaType === "tv") {
		const details: Record<string, any> = await getTvSeriesDetails(match.id);
		return {
			found: true,
			id: match.id,
			title: details.name || match.title,
			mediaType: "tv",
			releaseDate: details.first_air_date ?? null,
			lastAirDate: details.last_air_date ?? null,
			year: (details.first_air_date || "").split("-")[0] || null,
			numberOfSeasons: details.number_of_seasons ?? null,
			numberOfEpisodes: details.number_of_episodes ?? null,
			status: details.status ?? null,
			inProduction: details.in_production ?? null,
			voteAverage: typeof details.vote_average === "number" ? details.vote_average : null,
			overview: details.overview || null,
		};
	}

	const details: Record<string, any> = await getMovieDetails(match.id);
	return {
		found: true,
		id: match.id,
		title: details.title || match.title,
		mediaType: "movie",
		releaseDate: details.release_date ?? null,
		year: (details.release_date || "").split("-")[0] || null,
		runtimeMinutes: details.runtime ?? null,
		status: details.status ?? null,
		voteAverage: typeof details.vote_average === "number" ? details.vote_average : null,
		overview: details.overview || null,
	};
};

export const tmdbTools = {
	search_catalog: tool({
		description:
			"Search the full movie & TV catalog by title or short description. Use for 'I want to watch X' questions.",
		inputSchema: zodSchema(SearchCatalogSchema),
		execute: async ({ query, page }) => {
			const result = await searchMulti(query, page || 1);
			return { count: result.data?.length || 0, items: normalizeResults(result.data, "movie") };
		},
	}),

	discover_movies: tool({
		description:
			"Discover movies by genre, era, rating, and keywords. Use for mood- or category-based questions like 'funny 90s heist movies'.",
		inputSchema: zodSchema(DiscoverMoviesSchema),
		execute: async ({ genres, keywords, year_gte, year_lte, vote_min, sort_by, page }) => {
			const genreIds = resolveMovieGenreIds(genres);
			const keywordIds = await resolveKeywordIds(keywords || []);
			const resolvedSort = sort_by && MOVIE_SORTS.has(sort_by) ? sort_by : "popularity.desc";

			const params: Record<string, any> = {
				with_genres: genreIds.length ? genreIds.join(",") : undefined,
				with_keywords: keywordIds.length ? keywordIds.join(",") : undefined,
				"primary_release_date.gte": year_gte ? `${year_gte}-01-01` : undefined,
				"primary_release_date.lte": year_lte ? `${year_lte}-12-31` : undefined,
				"vote_average.gte": vote_min,
				sort_by: resolvedSort,
				page,
			};

			const result = await getMethod({ path: "/discover/movie", params });

			return {
				filters: {
					genres: genres || [],
					keywords: keywords || [],
					year_gte,
					year_lte,
					vote_min,
					sort_by: resolvedSort,
				},
				count: result.data?.length || 0,
				items: normalizeResults(result.data, "movie"),
			};
		},
	}),

	discover_tv: tool({
		description:
			"Discover TV series by genre and era. Use for series suggestions or mood-based TV questions.",
		inputSchema: zodSchema(DiscoverTvSchema),
		execute: async ({ genres, year_gte, year_lte, vote_min, sort_by, page }) => {
			const genreIds = resolveTvGenreIds(genres);
			const resolvedSort = sort_by && TV_SORTS.has(sort_by) ? sort_by : "popularity.desc";

			const params: Record<string, any> = {
				with_genres: genreIds.length ? genreIds.join(",") : undefined,
				"first_air_date.gte": year_gte ? `${year_gte}-01-01` : undefined,
				"first_air_date.lte": year_lte ? `${year_lte}-12-31` : undefined,
				"vote_average.gte": vote_min,
				sort_by: resolvedSort,
				page,
			};

			const result = await getMethod({ path: "/discover/tv", params });

			return {
				filters: {
					genres: genres || [],
					year_gte,
					year_lte,
					vote_min,
					sort_by: resolvedSort,
				},
				count: result.data?.length || 0,
				items: normalizeResults(result.data, "tv"),
			};
		},
	}),

	fetch_posters: tool({
		description:
			"Fetch TMDB poster images and detail links for specific titles the AI has ALREADY decided to recommend. This is NOT a recommendation source — call it only AFTER curating the recommendation list, to attach the poster cards to the reply.",
		inputSchema: zodSchema(FetchPostersSchema),
		execute: async ({ titles }) => {
			const items: ToolResultItem[] = [];
			for (const entry of titles) {
				const match = await findBestMatch(entry);
				if (match) items.push(match);
			}
			return { count: items.length, items };
		},
	}),

	get_title_details: tool({
		description:
			"Fetch live metadata from TMDB for one specific title: for TV shows, number of seasons, number of episodes, status (returning/ended/canceled), first & last air dates, in production; for movies, runtime, release date, and status. Use this to answer factual questions instead of relying on memory.",
		inputSchema: zodSchema(GetTitleDetailsSchema),
		execute: async ({ title, mediaType, year }) =>
			getTitleDetails({ title, mediaType, year }),
	}),
};

export type TmdbTools = typeof tmdbTools;