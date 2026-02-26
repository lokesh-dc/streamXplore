import getMethod from "@/utils/methods/get";

export default async function getTvSeriesDetails(id) {
	const result = await getMethod({
		path: `/tv/${id}`,
		params: {
			append_to_response: "videos,credits,images",
		},
	});
	return result.data;
}
