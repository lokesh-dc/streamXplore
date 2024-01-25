import { options } from "@/constants/api";

export default async function getMoviesGenres() {
	const details = await fetch(
		`https://api.themoviedb.org/3/genre/movie/list?language=en`,
		options
	)
		.then((response) => response.json())
		.then((response) => response)
		.catch((err) => err);
	return details;
}
