import { options } from "@/constants/api";

export default function discoverMovies({ page, genre }) {
	const details = fetch(
		`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${
			page || 1
		}${genre ? `&with_genres=${genre}` : ""}&sort_by=popularity.desc`,
		options
	)
		.then((response) => response.json())
		.then((response) => response)
		.catch((err) => err);
	return details;
}
