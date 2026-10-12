export interface MoodDefinition {
	id: string;
	name: string;
	genres: number[];
}

/** Shared mood definitions used by the client wizard and the AI curation route. */
export const MOODS: MoodDefinition[] = [
	{ id: "action-adventure", name: "Action & Adventure", genres: [28, 12, 10759] },
	{ id: "animation", name: "Animation", genres: [16] },
	{ id: "comedy", name: "Comedy", genres: [35] },
	{ id: "crime", name: "Crime", genres: [80] },
	{ id: "documentary", name: "Documentary", genres: [99] },
	{ id: "drama", name: "Drama", genres: [18] },
	{ id: "family", name: "Family", genres: [10751] },
	{ id: "fantasy-scifi", name: "Fantasy & Sci-Fi", genres: [14, 878, 10765] },
	{ id: "horror", name: "Horror", genres: [27] },
	{ id: "mystery-thriller", name: "Mystery & Thriller", genres: [9648, 53] },
	{ id: "romance", name: "Romance", genres: [10749, 10766] },
	{ id: "western", name: "Western", genres: [37] },
];

/** Resolve selected mood ids to their combined TMDB genre ids. */
export const resolveMoodGenres = (ids: string[]): number[] =>
	ids?.length
		? MOODS.filter((m) => ids.includes(m.id)).flatMap((m) => m.genres)
		: [];

export const moodName = (id: string): string => MOODS.find((m) => m.id === id)?.name || id;