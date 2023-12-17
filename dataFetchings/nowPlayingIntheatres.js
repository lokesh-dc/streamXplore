import getMethod from "@/utils/methods/get";

export default async function getMoviesPlayingInThetres(page) {
	const randomPage = Math.floor(Math.random() * 10 + 1);
	const movies = await getMethod({
		path: `/movie/now_playing?language=en-US&page=${page || randomPage}`,
	});
	return movies;
}
