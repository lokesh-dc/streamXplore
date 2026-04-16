import getMethod from "@/utils/methods/get";

export default async function getVideos(id) {
	const result = await getMethod({
		path: `/movie/${id}/videos`,
	});
	return result.data;
}
