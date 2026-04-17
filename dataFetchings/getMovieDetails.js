import getMethod from "@/utils/methods/get";

export default async function getMovieDetails(id) {
	const result = await getMethod({
		path: `/movie/${id}`,
		// Removed append_to_response to optimize discovery flow
	});
	return result.data;
}
