import getMethod from "../utils/methods/get";

export default async function getUpcomingMovies() {
	const movies = await getMethod({
		path: "/movie/upcoming?language=en-US&page=1",
	});
	return movies;
}
