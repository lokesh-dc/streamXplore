import { options } from "@/constants/api";

export default function getMovieDetails(id) {
	const details = fetch(
		`https://api.themoviedb.org/3/movie/${id}?append_to_response=videos,credits,images`,
		options
	)
		.then((response) => response.json())
		.then((response) => response)
		.catch((err) => err);
	return details;
}
