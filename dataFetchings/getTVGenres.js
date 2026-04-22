import getMethod from "@/utils/methods/get";

export default async function getTVGenres() {
	return await getMethod({
		path: "/genre/tv/list",
		props: { next: { revalidate: 86400 } }, // 24hrs
	});
}
