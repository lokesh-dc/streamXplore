import getMethod from "@/utils/methods/get";

export default async function getRecommendations(movieId) {
	const recommendations = await getMethod({
		path: `/movie/${movieId}/recommendations?language=en-US&page=1`,
		props: { next: { revalidate: 86400 } }, // 24hrs
	});
	return recommendations;
}
