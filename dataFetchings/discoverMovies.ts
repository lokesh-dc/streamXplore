import getMethod from "@/utils/methods/get";
import { newestDateLte } from "@/utils";

interface DiscoverMoviesProps {
	page?: number;
	genre?: string;
	sort_by?: string;
	year_gte?: string | null;
	watchProvider?: number | string;
	watchRegion?: string;
	monetization?: string;
}

export default async function discoverMovies({
	page = 1,
	genre,
	sort_by = "popularity.desc",
	year_gte = null,
	watchProvider,
	watchRegion,
	monetization
}: DiscoverMoviesProps) {
	const params: any = {
		page,
		with_genres: genre,
		sort_by,
		with_watch_providers: watchProvider,
		watch_region: watchProvider ? watchRegion : undefined,
		with_watch_monetization_types: watchProvider ? monetization : undefined,
		...newestDateLte(sort_by),
	};

	if (year_gte) {
		params["primary_release_date.gte"] = `${year_gte}-01-01`;
	}

	return await getMethod({
		path: "/discover/movie",
		params,
	});
}
