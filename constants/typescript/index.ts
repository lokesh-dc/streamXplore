export interface movieDetails {
	adult: boolean | null;
	backdrop_path: string | null;
	genre_id: Array<number> | null;
	id: number | null;
	original_language: string | null;
	original_title: string | null;
	overview: string | null;
	popularity: number | null;
	poster_path: string | null;
	release_date: string | null;
	title: string | null;
	name: string | null;
	video: boolean | string | null;
	vote_average: number | null;
	vote_count: number | null;
	media_type: string | null
}

export interface searchedDataEntry extends movieDetails {
	name: string;
	media_type: string;
	profile_path: string | null;
	first_air_date: string
}

export interface genresType {
	id: number;
	name: string
}

export interface production_companies {
	id: number;
	logo_path: string;
	name: string;
	origin_country: string;
}

export interface movieDetailsPage {
	id: string;
	adult: boolean;
	backdrop_path: string;
	poster_path: string;
	budget: number;
	genres: Array<genresType>;
	homepage: string;
	imdb_id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	production_companies: Array<production_companies>;
	production_countries: Array<genresType>;
	release_date: string;
	revenue: number;
	runtime: number;
	status: string;
	tagline: string;
	title: string;
	vote_average: number;
	vote_count: number;
	details: any;
	backdrops: Array<movieImages>;
	logos: Array<movieImages>;
	videos: Array<movieVideos>;
	recommendations: movieRecommendations;
}

export interface movieRecommendations {
	page: number;
	results: Array<movieDetails>;
	total_pages: number;
	total_results: number;
}

export interface movieImages {
	aspect_ratio: number;
	file_path: string;
	height: number;
	iso_639_1: string;
	vote_average: number;
	vote_count: number;
	width: number;
}


export interface movieVideos {
	iso_639_1: string;
	iso_3166_1: string;
	name: string;
	key: string;
	size: number;
	type: string;
	official: boolean;
	published_at: string;
	id: string;
}



export interface seriesDetails {
	id: string;
	adult: boolean;
	backdrop_path: string;
	poster_path: string;
	genres: Array<genresType>;
	homepage: string;
	imdb_id: number;
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	production_companies: Array<production_companies>;
	production_countries: Array<genresType>;
	release_date: string;
	runtime: number;
	status: string;
	tagline: string;
	title: string;
	vote_average: number;
	vote_count: number;
	details: any;
	backdrops: Array<movieImages>;
	logos: Array<movieImages>;
	videos: Array<movieVideos>;
	seasons: Array<tvSeriesSeasons>;
	last_episode_to_air: episodeDetails;
	next_episode_to_air: episodeDetails;
}

export interface tvSeriesSeasons {
	air_date: string;
	episode_count: number;
	id: number;
	name: string;
	overview: string;
	poster_path: string;
	season_number: number;
	vote_average: number;
}

export interface episodeDetails {
	air_date: string;
	episode_number: number;
	episode_type: string;
	id: number;
	name: string;
	overview: string;
	production_code: string;
	runtime: number;
	season_number: number;
	show_id: number;
	still_path: string;
	vote_average: number;
	vote_count: number;
}