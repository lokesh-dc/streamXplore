import getMethod from "@/utils/methods/get";
import { newestDateLte } from "@/utils";

interface DiscoverTVProps {
	genre?: string;
	page?: number;
	sort_by?: string;
	year_gte?: string | null;
	watchProvider?: number | string;
	watchRegion?: string;
	monetization?: string;
}

export default async function discoverTV({
	genre,
	page = 1,
	sort_by = "popularity.desc",
	year_gte = null,
	watchProvider,
	watchRegion,
	monetization
}: DiscoverTVProps) {
	const params: any = {
		with_genres: genre,
		page: page,
		sort_by,
		with_watch_providers: watchProvider,
		watch_region: watchProvider ? watchRegion : undefined,
		with_watch_monetization_types: watchProvider ? monetization : undefined,
		...newestDateLte(sort_by),
	};

	if (year_gte) {
		params["first_air_date.gte"] = `${year_gte}-01-01`;
	}

	return await getMethod({
		path: `/discover/tv`,
		params,
	});
}
