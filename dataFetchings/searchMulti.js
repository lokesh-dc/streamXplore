import getMethod from "@/utils/methods/get";

export default async function searchMulti(query = "", page = 1) {
	return await getMethod({
		path: "/search/multi",
		params: { query, page },
	});
}
