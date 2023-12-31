export const decorateLink = (link) => {
	if (link == null) return "#";
	return link
		.replaceAll(".", "")
		.replaceAll("?", "")
		.toLowerCase()
		.split(" ")
		.join("-");
};
