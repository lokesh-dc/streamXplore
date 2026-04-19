import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import getMovieDetails from "@/dataFetchings/getMovieDetails";
import DetailV2 from "@/components/ui/detail/DetailV2";
import RecommendationContainer from "@/components/containers/RecommendationContainer";

interface PageProps {
	params: Promise<{
		title: string;
		id: string;
	}>;
}

/**
 * Fetches and transforms movie details for the server component.
 */
async function getPageData(id: string) {
	const details = await getMovieDetails(
		id,
		"videos,credits,images,recommendations",
	);

	if (!details || details.success === false) return null;

	if (details.adult) {
		redirect("/popular");
	}

	return details;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { title } = await params;
	return {
		title: decodeURIComponent(title),
	};
}

const MoviePage = async ({ params }: PageProps) => {
	const { id } = await params;
	const data = await getPageData(id);

	if (!data) {
		return <div className="p-10 text-center">Movie not found</div>;
	}

	const {
		credits,
		videos,
		recommendations,
	} = data;

	return (
		<div className="flex flex-col gap-3 pb-5 bg-[#121212]">
			<DetailV2 
				data={data} 
				credits={credits} 
				videos={videos?.results} 
			/>
			<div className="default_screen_padding mb-4">
				<RecommendationContainer
					data={recommendations?.results}
					title="Recommendations"
				/>
			</div>
		</div>
	);
};

export default MoviePage;
