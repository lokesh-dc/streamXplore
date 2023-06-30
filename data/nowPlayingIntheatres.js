import { api_baseLink } from "@/constants";
import { options } from "../constants/api";

export default async function getMoviesPlayingInThetres() {
	try {
		const randomPage = Math.floor(Math.random() * 10 + 1);
		const response = await fetch(
			`${api_baseLink}/movie/now_playing?language=en-US&page=${randomPage}`,
			options
		)
			.then((response) => response.json())
			.then((response) => response)
			.catch((err) => console.error(err));

		return response?.results;
	} catch (e) {
		console.log("Error", e);
		return e;
	}
}
