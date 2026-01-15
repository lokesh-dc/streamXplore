import { api_baseLink } from "@/constants";
import { options } from "@/constants/api";
const getMethod = async ({ path, params, props = {} }) => {
	const response = await fetch(
		`${api_baseLink}${path}&include_adult=false`,
		options,
		{ next: { revalidate: 86400 }, ...props }
	);

	let data = await response.json();
	return {
		data: data?.results || data?.genres,
		totalPages: data?.total_pages,
	};
};

export default getMethod;
