import getMethod from "@/utils/methods/get";

export default async function getPopularMovies() {
	const movies = await getMethod({
		path: `/trending/movie/day?language=en-US`,
	});
	return movies;
}
