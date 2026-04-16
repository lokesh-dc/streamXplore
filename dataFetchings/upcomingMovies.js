import getMethod from "../utils/methods/get";

export default async function getUpcomingMovies(page = 1) {
	return await getMethod({
		path: "/movie/upcoming",
		params: { page },
	});
}
