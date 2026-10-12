export const decorateLink = (link) => {
	if (link == null) return "#";
	return link
		.replaceAll(".", "")
		.replaceAll("?", "")
		.toLowerCase()
		.split(" ")
		.join("-");
};

/** True if the title has a release/aired date on or before today. Unknown dates count as released. */
export const isReleased = (item) => {
	const date = item?.release_date || item?.first_air_date;
	if (date) {
		const releaseTime = new Date(`${date}T23:59:59`).getTime();
		if (!Number.isNaN(releaseTime)) return releaseTime <= Date.now();
	}
	const year = item?.year;
	if (year && /^\d{4}$/.test(String(year))) {
		return Number(year) <= new Date().getFullYear();
	}
	return true;
};

/** Cap applied to "Newest First" sorts so only titles released on or before today appear. */
export const newestDateLte = (sort) => {
	const today = new Date().toISOString().slice(0, 10);
	if (sort === "primary_release_date.desc") return { "primary_release_date.lte": today };
	if (sort === "first_air_date.desc") return { "first_air_date.lte": today };
	return {};
};
