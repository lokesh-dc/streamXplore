import getMethod from "@/utils/methods/get";

interface DiscoverMoviesProps {
	page?: number;
	genre?: string;
	sort_by?: string;
	year_gte?: string | null;
}

export default async function discoverMovies({
	page = 1,
	genre,
	sort_by = "popularity.desc",
	year_gte = null
}: DiscoverMoviesProps) {
	const params: any = {
		page,
		with_genres: genre,
		sort_by,
	};

	if (year_gte) {
		params["primary_release_date.gte"] = `${year_gte}-01-01`;
	}

	return await getMethod({
		path: "/discover/movie",
		params,
	});
}
