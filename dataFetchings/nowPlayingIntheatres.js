import getMethod from "@/utils/methods/get";

export default async function getMoviesPlayingInThetres(page) {
	const randomPage = Math.floor(Math.random() * 10 + 1);
	return await getMethod({
		path: "/movie/now_playing",
		params: {
			page: page || randomPage,
		},
	});
}
