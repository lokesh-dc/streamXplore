import React, { ReactElement } from "react";
import getMovieDetails from "@/data/getMovieDetails";
import { movieDetailsPage } from "@/constants/typescript";
import HeroSection from "@/components/ui/detail/HeroSection";
import IntroSection from "@/components/ui/detail/IntroSection";
import PosterImage from "@/components/ui/detail/PosterImage";
// import MovieImages from "@/components/containers/MovieImages";

import dynamic from "next/dynamic";
import VideosContainer from "@/components/containers/VideosContainer";
const MovieImagesContainer = dynamic(
	() => import("@/components/containers/MovieImagesContainer")
);

const Movie: React.FC<movieDetailsPage> = ({
	id,
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
	backdrops,
	logos,
	videos,
	details,
}): ReactElement => {
	console.log(details);

	return (
		<>
			<HeroSection
				backdrop_path={backdrop_path || poster_path}
				title={title}
				logos={logos}
			/>
			<div className="flex flex-col gap-5 pb-5">
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
				/>
				{backdrops && backdrops?.length > 0 ? (
					<MovieImagesContainer title="title" data={backdrops} />
				) : null}

				{videos && videos?.length > 0 ? (
					<VideosContainer data={videos} movieId={id} />
				) : null}
			</div>
		</>
	);
};
export default Movie;

export async function getServerSideProps(context: any) {
	const { id } = context.query;
	const details = await getMovieDetails(id);

	if (details?.adult) {
		return {
			redirect: {
				destination: "/popular",
				permanent: true,
			},
		};
	}

	const {
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
		images,
		videos,
	} = details;

	const { backdrops, posters, logos } = images;
	const { results } = videos;
	return {
		props: {
			id,
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
			videos: results,
		},
	};
}
