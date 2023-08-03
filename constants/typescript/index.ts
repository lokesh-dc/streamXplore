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
}


export interface genresType {
	id: number;
	name : string
}

export interface production_companies { 
	id: number;
    logo_path: string;
    name: string;
	origin_country: string;
}