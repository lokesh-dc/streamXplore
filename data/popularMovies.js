import getMethod from "@/utils/methods/get";

export default async function getPopularMovies(page = 0) {
	const randomPage = Math.floor(Math.random() * 10 + 1);
	const movies = await getMethod({
		path: `/movie/popular?language=en-US&page=${page || randomPage}`,
	});
	return movies;
}
