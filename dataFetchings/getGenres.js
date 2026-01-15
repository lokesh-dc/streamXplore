import getMethod from "@/utils/methods/get";

export default async function getMoviesGenres() {
	const movies = await getMethod({
		path: `/genre/movie/list?language=en`,
		props: { next: { revalidate: 86400 } }, // 24hrs
	});
	return movies;
}
