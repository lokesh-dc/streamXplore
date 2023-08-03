import { options } from "@/constants/api";

export default function getMovieDetails(id) {
	const videos = fetch(
		`https://api.themoviedb.org/3/movie/${id}/videos`,
		options
	)
		.then((response) => response.json())
		.then((response) => response)
		.catch((err) => err);
	return videos;
}
