import getMethod from "@/utils/methods/get";
import { cache } from "react";

const getTvSeriesDetails = cache(async (id: string | number, appendToResponse: string | null = null) => {
	const params: any = {};
	if (appendToResponse) {
		params.append_to_response = appendToResponse;
	}

	const result = await getMethod({
		path: `/tv/${id}`,
		params,
	});
	return result.data;
});

export default getTvSeriesDetails;
