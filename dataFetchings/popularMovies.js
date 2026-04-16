import getMethod from "@/utils/methods/get";

export default async function getPopularMovies(page) {
	const randomPage = Math.floor(Math.random() * 10 + 1);
	return await getMethod({
		path: "/movie/popular",
		params: {
			page: page || randomPage,
		},
	});
}
