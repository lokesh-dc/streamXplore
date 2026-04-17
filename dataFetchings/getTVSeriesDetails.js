import getMethod from "@/utils/methods/get";

export default async function getTvSeriesDetails(id) {
	const result = await getMethod({
		path: `/tv/${id}`,
		// Removed append_to_response to optimize discovery flow
	});
	return result.data;
}
