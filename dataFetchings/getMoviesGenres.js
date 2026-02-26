import getMethod from "@/utils/methods/get";

export default async function getMoviesGenres() {
	return await getMethod({
		path: "/genre/movie/list",
		props: { next: { revalidate: 86400 } }, // 24hrs
	});
}
