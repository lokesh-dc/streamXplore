import getMethod from "@/utils/methods/get";

export default async function getTrendingSeries(page = 1) {
	return await getMethod({
		path: "/trending/tv/day",
		params: { page },
	});
}
