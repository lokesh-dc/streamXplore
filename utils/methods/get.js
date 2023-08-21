import { api_baseLink } from "@/constants";
import { options } from "@/constants/api";
const getMethod = async ({ path, params }) => {
	const response = await fetch(`${api_baseLink}${path}?include_adult=false`, options);

	const data = await response.json();
	return {
		data: data?.results,
		totalPages: data?.total_pages,
	};
};

export default getMethod;
