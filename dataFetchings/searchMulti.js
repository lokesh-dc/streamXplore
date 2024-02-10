import getMethod from "@/utils/methods/get";

export default async function searchMulti(query = "", page = 1) {
	const movies = await getMethod({
		path: `/search/multi?query=${query}&language=en-US&page=${page}`,
	});
	return movies;
}
