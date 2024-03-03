import { options } from "@/constants/api";

export default function getSeriesSeasonDetails(id, season) {
	const details = fetch(
		`https://api.themoviedb.org/3/tv/${id}/season/${season}?language=en-US`,
		options
	)
		.then((response) => response.json())
		.then((response) => response)
		.catch((err) => console.error(err));
	return details;
}
