import getMethod from "@/utils/methods/get";

export default async function discoverTV({
	genre,
	page = 1,
	sort_by = "popularity.desc",
	year_gte,
}) {
	const params = {
		with_genres: genre,
		page: page,
		sort_by,
	};

	if (year_gte) {
		params["first_air_date.gte"] = `${year_gte}-01-01`;
	}

	return await getMethod({
		path: `/discover/tv`,
		params,
	});
}
