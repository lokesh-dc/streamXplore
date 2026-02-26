import getMethod from "@/utils/methods/get";

export default async function getTrendingMovies() {
	return await getMethod({
		path: "/trending/movie/day",
	});
}
