export const decorateLink = (link) => {
	if (link == null) return "#";
	return link.toLowerCase().split(" ").join("-");
};
