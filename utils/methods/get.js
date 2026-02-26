import { api_baseLink } from "@/constants";
import { options } from "@/constants/api";

/**
 * Generic GET method for TMDB API
 * @param {Object} options - Configuration for the request
 * @param {string} options.path - The API endpoint path (starting with /)
 * @param {Object} [options.params] - Query parameters
 * @param {Object} [options.props] - Additional fetch options (e.g., next.revalidate)
 */
const getMethod = async ({ path, params = {}, props = {} }) => {
	const url = new URL(`${api_baseLink}${path}`);

	// Add default parameters
	url.searchParams.set("language", "en-US");
	url.searchParams.set("include_adult", "false");

	// Add custom parameters
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			url.searchParams.set(key, value);
		}
	});

	try {
		const response = await fetch(url.toString(), {
			...options,
			...props,
		});

		if (!response.ok) {
			throw new Error(
				`TMDB API error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		// Determine the most likely main data payload
		// 1. If it has 'results', it's a standard list
		// 2. If it has 'genres' but NO 'id', it's the global genres list
		// 3. Otherwise, it's likely a detail object (like movie or TV details)
		let extractedData = data;
		if (data?.results) {
			extractedData = data.results;
		} else if (data?.genres && !data?.id) {
			extractedData = data.genres;
		}

		return {
			data: extractedData,
			totalPages: data?.total_pages || 1,
			raw: data, // Always provide the full raw response
		};
	} catch (error) {
		console.error("Fetch error:", error);
		return {
			data: null,
			totalPages: 0,
			error,
		};
	}
};

export default getMethod;
