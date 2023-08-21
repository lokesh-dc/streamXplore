import { StringLiteral } from "typescript";

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
	logos : Array<movieImages>
}

export interface movieImages {
	aspect_ratio: number;
	file_path: string;
	height: number;
	iso_639_1: string;
	vote_average: number;
	vote_count : number;
	width : number;
}