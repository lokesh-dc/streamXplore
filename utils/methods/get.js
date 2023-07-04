import { api_baseLink } from "@/constants";
import { options } from "@/constants/api";
import { movieDetails } from "@/constants/typescript";
import React from "react";
const getMethod = async ({ path, params }) => {
	const response = await fetch(`${api_baseLink}${path}`, options);

	const data = await response.json();
	return {
		data: data?.results,
	};
};

export default getMethod;
