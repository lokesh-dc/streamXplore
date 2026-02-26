import getMethod from "@/utils/methods/get";

export default async function discoverMovies({ page = 1, genre }) {
	return await getMethod({
		path: "/discover/movie",
		params: {
			page,
			with_genres: genre,
			sort_by: "popularity.desc",
		},
	});
}
