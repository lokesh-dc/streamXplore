/**
 * Static genre tables used to ground the language model.
 * We feed the model the canonical genre names (not IDs) and resolve
 * names → TMDB genre IDs inside tool execution. This avoids the model
 * hallucinating numeric IDs.
 */

export const MOVIE_GENRES: Record<string, number> = {
	Action: 28,
	Adventure: 12,
	Animation: 16,
	Comedy: 35,
	Crime: 80,
	Documentary: 99,
	Drama: 18,
	Family: 10751,
	Fantasy: 14,
	History: 36,
	Horror: 27,
	Music: 10402,
	Mystery: 9648,
	Romance: 10749,
	"Science Fiction": 878,
	"TV Movie": 10770,
	Thriller: 53,
	War: 10752,
	Western: 37,
};

export const TV_GENRES: Record<string, number> = {
	"Action & Adventure": 10759,
	Animation: 16,
	Comedy: 35,
	Crime: 80,
	Documentary: 99,
	Drama: 18,
	Family: 10751,
	Kids: 10762,
	Mystery: 9648,
	News: 10763,
	Reality: 10764,
	"Sci-Fi & Fantasy": 10765,
	Soap: 10766,
	Talk: 10767,
	"War & Politics": 10768,
	Western: 37,
};

export const MOVIE_GENRE_NAMES = Object.keys(MOVIE_GENRES);
export const TV_GENRE_NAMES = Object.keys(TV_GENRES);

/** Resolve an array of genre names to TMDB genre IDs for the movie table. */
export const resolveMovieGenreIds = (names?: string[] | null): number[] => {
	if (!names?.length) return [];
	return names
		.map((name) => MOVIE_GENRES[name.trim()])
		.filter((id): id is number => typeof id === "number");
};

/** Resolve an array of genre names to TMDB genre IDs for the TV table. */
export const resolveTvGenreIds = (names?: string[] | null): number[] => {
	if (!names?.length) return [];
	return names
		.map((name) => TV_GENRES[name.trim()])
		.filter((id): id is number => typeof id === "number");
};