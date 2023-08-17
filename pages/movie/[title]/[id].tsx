import React, { ReactElement } from "react";
import getMovieDetails from "@/data/getMovieDetails";
import { movieDetailsPage } from "@/constants/typescript";
import HeroSection from "@/components/ui/detail/HeroSection";
import IntroSection from "@/components/ui/detail/IntroSection";
import PosterImage from "@/components/ui/detail/PosterImage";
// import MovieImages from "@/components/containers/MovieImages";

import dynamic from "next/dynamic";
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
	details,
}): ReactElement => {
	return (
		<>
			<HeroSection backdrop_path={backdrop_path || poster_path} title={title} />
			<div className="pb-96">
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
			</div>
		</>
	);
};
export default Movie;

export async function getServerSideProps(context: any) {
	const { id } = context.query;
	const details = await getMovieDetails(id);
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
	} = details;

	if (adult) {
		return {
			redirect: {
				destination: "/popular",
				permanent: true,
			},
		};
	}

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
		},
	};
}
