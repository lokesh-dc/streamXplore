import { api_baseLink } from "@/constants";
import { options } from "../constants/api";

export default async function getPopularMovies() {
	try {
		const response = await fetch(
			`${api_baseLink}/trending/tv/day?language=en-US`,
			options
		);
		const data = await response.json();
		return data?.results;
	} catch (e) {
		console.log("Error", e);
		return e;
	}
}
