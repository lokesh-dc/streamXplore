import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import getMovieDetails from "@/dataFetchings/getMovieDetails";
import HeroSection from "@/components/ui/detail/HeroSection";
import IntroSection from "@/components/ui/detail/IntroSection";
import PosterImage from "@/components/ui/detail/PosterImage";
import VideosContainer from "@/components/functional-components/VideoContainer";
import ImagesModalContainer from "@/components/functional-components/ImagesModalContainer";
import MoviesContainer from "@/components/containers/MoviesContainer";

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
	const details = await getMovieDetails(id);

	if (!details || details.success === false) return null;

	if (details.adult) {
		redirect("/popular");
	}

	const {
		id: movieId,
		adult,
		backdrop_path,
		poster_path,
		budget,
		genres,
		homepage,
		imdb_id,
		original_language,
		original_title,
		overview,
		popularity,
		production_companies,
		production_countries,
		release_date,
		revenue,
		runtime,
		tagline,
		title,
		vote_average,
		vote_count,
		images = { backdrops: [], posters: [], logos: [] },
		videos = { results: [] },
		recommendations = { results: [] },
	} = details;

	const { backdrops, logos } = images;
	const { results: videoResults } = videos;

	return {
		id: movieId,
		adult,
		backdrop_path,
		poster_path,
		budget,
		genres,
		homepage,
		imdb_id,
		original_language,
		original_title,
		overview,
		popularity,
		production_companies,
		production_countries,
		release_date,
		revenue,
		runtime,
		tagline,
		title,
		vote_average,
		vote_count,
		details,
		logos,
		backdrops: backdrops || [],
		videos: videoResults || [],
		recommendations,
	};
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
		id: movieId,
		backdrop_path,
		poster_path,
		release_date,
		runtime,
		overview,
		vote_average,
		tagline,
		genres,
		title,
		videos,
		backdrops,
		recommendations,
	} = data;

	return (
		<>
			<HeroSection backdrop_path={backdrop_path || poster_path} title={title} />
			<div className="flex flex-col gap-3 pb-5 default_screen_padding mb-4">
				<PosterImage poster_path={poster_path} />
				<IntroSection
					title={title}
					poster_path={poster_path}
					release_date={release_date}
					runtime={runtime}
					overview={overview}
					vote_average={vote_average}
					tagline={tagline}
					genres={genres}
					pageType={"movies"}
				/>
				<VideosContainer data={videos} movieId={movieId} />
				<ImagesModalContainer backdrops={backdrops} title={title} />
				<MoviesContainer
					data={recommendations?.results}
					title="Recommendations"
				/>
			</div>
		</>
	);
};

export default MoviePage;
