/** Shared contracts between the AI recommendations route and the client. */

export interface SeedTitle {
	id: number;
	title: string;
	mediaType: "movie" | "tv";
}

export interface CurationRequest {
	moods: string[];
	seeds: SeedTitle[];
	year: string;
	sort: string;
}

export interface AiPick {
	id: number;
	title: string;
	mediaType: "movie" | "tv";
	year: string | null;
	voteAverage: number | null;
	genres: string[];
	overview: string | null;
	posterPath: string | null;
	backdropPath: string | null;
	reason: string;
}

export interface CurationResponse {
	aiGenerated: boolean;
	summary: string;
	picks: AiPick[];
}