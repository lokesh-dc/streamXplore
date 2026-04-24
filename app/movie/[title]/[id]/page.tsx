import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import getMovieDetails from "@/dataFetchings/getMovieDetails";
import DetailV2 from "@/components/ui/detail/DetailV2";
import RecommendationContainer from "@/components/containers/RecommendationContainer";
import { getImageBaseLink } from "@/constants";

interface PageProps {
	params: Promise<{
		title: string;
		id: string;
	}>;
}

const APPEND_TO_RESPONSE = "videos,credits,images,recommendations";

/**
 * Fetches and transforms movie details for the server component.
 */
async function getPageData(id: string) {
	const details = await getMovieDetails(
		id,
		APPEND_TO_RESPONSE,
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
	const { id, title: urlTitle } = await params;
	const data = await getMovieDetails(id, APPEND_TO_RESPONSE);

	if (!data || data.success === false) {
		return {
			title: "Movie Not Found",
		};
	}

	const title = data.title || data.original_title;
	const description = data.overview?.slice(0, 160);
	const image = getImageBaseLink({
		type: "poster",
		quality: "xl",
		path: data.poster_path,
	});

	return {
		title: title,
		description: description,
		alternates: {
			canonical: `/movie/${urlTitle}/${id}`,
		},
		openGraph: {
			title: title,
			description: description,
			type: "video.movie",
			url: `/movie/${urlTitle}/${id}`,
			images: [
				{
					url: image,
					width: 780,
					height: 1170,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: title,
			description: description,
			images: [image],
		},
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
		title,
		overview,
		release_date,
		vote_average,
		poster_path,
		genres,
	} = data;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Movie",
		name: title,
		description: overview,
		image: getImageBaseLink({ type: "poster", quality: "xl", path: poster_path }),
		datePublished: release_date,
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: vote_average,
			bestRating: "10",
			ratingCount: data.vote_count,
		},
		genre: genres?.map((g: any) => g.name),
		actor: credits?.cast?.slice(0, 10).map((c: any) => ({
			"@type": "Person",
			name: c.name,
		})),
		director: credits?.crew
			?.filter((c: any) => c.job === "Director")
			.map((c: any) => ({
				"@type": "Person",
				name: c.name,
			})),
	};

	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://hookedonmovies-app.vercel.app",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Movies",
				item: "https://hookedonmovies-app.vercel.app/movies",
			},
			{
				"@type": "ListItem",
				position: 3,
				name: title,
				item: `https://hookedonmovies-app.vercel.app/movie/${encodeURIComponent(title)}/${id}`,
			},
		],
	};

	return (
		<div className="flex flex-col gap-3 pb-5 bg-[#121212]">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
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
