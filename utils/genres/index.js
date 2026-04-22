export const buildGenreMap = (genres = []) => {
	return genres?.reduce((acc, genre) => {
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

export const normalizeMovie = (movies, movieGenres) => {
	let movieMap = buildGenreMap(movieGenres);
	return movies?.map((movie) => {
		return {
			...movie,
			media_type: "movie",
			genres: mapGenres({
				ids: movie.genre_ids || movie.genres,
				type: "movie",
				genreMaps: { movie: movieMap },
			}),
		};
	});
};

export const normalizeTV = (series, tvGenres) => {
	let tvMap = buildGenreMap(tvGenres);
	return series?.map((item) => {
		return {
			...item,
			media_type: "tv",
			genres: mapGenres({
				ids: item.genre_ids || item.genres,
				type: "tv",
				genreMaps: { tv: tvMap },
			}),
		};
	});
};

