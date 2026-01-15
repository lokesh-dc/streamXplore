export const buildGenreMap = (genres = []) => {
	return genres.reduce((acc, genre) => {
		acc[genre.id] = genre.name;
		return acc;
	}, {});
};

export const mapGenres = ({ ids = [], type, genreMaps }) => {
	let map = genreMaps[type];
	if (!map) return [];
	return ids
		.map((id) => {
			return { id: id, name: map[id] };
		})
		.filter(Boolean);
};

export const normalizeMovie = (movies, genreMaps) => {
	let map = buildGenreMap(genreMaps);
	return movies?.map((movie) => {
		return {
			...movie,
			genres: mapGenres({
				ids: movie.genre_ids || movie.genres,
				type: "movie",
				genreMaps: { movie: map },
			}),
		};
	});
};
