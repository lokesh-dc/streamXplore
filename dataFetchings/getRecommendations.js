import getMethod from "@/utils/methods/get";

export default async function getRecommendations(movieId) {
	return await getMethod({
		path: `/movie/${movieId}/recommendations`,
		props: { next: { revalidate: 86400 } }, // 24hrs
	});
}
