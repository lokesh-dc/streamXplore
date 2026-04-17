import getMethod from "@/utils/methods/get";

export default async function getMovieDetails(id) {
	const result = await getMethod({
		path: `/movie/${id}`,
		params: {
			append_to_response: "videos,credits,images,recommendations",
		},
	});
	return result.data;
}
