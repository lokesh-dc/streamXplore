import getMethod from "@/utils/methods/get";

export default async function getTvSeriesDetails(id: string | number, appendToResponse: string | null = null) {
	const params: any = {};
	if (appendToResponse) {
		params.append_to_response = appendToResponse;
	}

	const result = await getMethod({
		path: `/tv/${id}`,
		params,
	});
	return result.data;
}
