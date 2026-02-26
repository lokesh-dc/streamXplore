import getMethod from "@/utils/methods/get";

export default async function getSeriesSeasonDetails(id, season) {
	const result = await getMethod({
		path: `/tv/${id}/season/${season}`,
	});
	return result.data;
}
