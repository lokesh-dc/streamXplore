export const api_baseLink = "https://api.themoviedb.org/3";
export const image_baseLink = "https://image.tmdb.org/t/p";

export const getImageBaseLink = ({ type, quality, path }) => {
	const qualtiyTypes = {
		poster: { sm: "w92", md: "w185", lg: "w500", xl: "w780" },
		backdrop: { sm: "w300", md: "w780", lg: "w1280" },
		still: { sm: "w92", md: "w185", lg: "w300" },
		profile: { sm: "w45", md: "w185", lg: "w632" },
		logo: { sm: "w92", md: "w185", lg: "w300", xl: "w500" },
	};

	let renderQuality;
	if (type && qualtiyTypes[type] && qualtiyTypes[type][quality]) {
		renderQuality = qualtiyTypes[type][quality];
	}

	return `${image_baseLink}/${renderQuality || "original"}${path}`;
};
