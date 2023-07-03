import { api_baseLink } from "@/constants";
import { options } from "@/constants/api";

export default async function getMethod({ path, params }) {
	const response = await fetch(`${api_baseLink}${path}`, options);

	const data = await response.json();
	return data;
}
