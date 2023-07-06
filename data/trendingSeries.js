import getMethod from "@/utils/methods/get";

export default async function getPopularSeries(page) {
	const movies = await getMethod({
		path: `/trending/tv/day?language=en-US&page=${page || 1}`,
	});
	return movies;
}
