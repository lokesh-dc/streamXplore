import getMethod from "@/utils/methods/get";
import { cache } from "react";

const getMovieDetails = cache(async (id: string | number, appendToResponse: string | null = null) => {
	const params: any = {};
	if (appendToResponse) {
		params.append_to_response = appendToResponse;
	}

	const result = await getMethod({
		path: `/movie/${id}`,
		params,
	});
	return result.data;
});

export default getMovieDetails;
