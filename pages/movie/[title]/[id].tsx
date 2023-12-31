import React, { ReactElement, useState } from "react";
import getMovieDetails from "@/dataFetchings/getMovieDetails";
import { movieDetailsPage } from "@/constants/typescript";
import HeroSection from "@/components/ui/detail/HeroSection";
import IntroSection from "@/components/ui/detail/IntroSection";
import PosterImage from "@/components/ui/detail/PosterImage";

import dynamic from "next/dynamic";
import VideosContainer from "@/components/containers/VideosContainer";
import Head from "next/head";
import Modal from "@/modals/Modal";
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
	const [modalImage, setModalImage] = useState("");
	const changeModalImage = (imgSrc: string) => {
		setModalImage(imgSrc);
	};

	return (
		<>
			<Head>
				<title>{original_title}</title>
			</Head>
			<HeroSection backdrop_path={backdrop_path || poster_path} title={title} />
			<div className="flex flex-col gap-2 pb-5 default_screen_padding mb-4">
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
					<MovieImagesContainer
						title="title"
						data={backdrops}
						stateChange={changeModalImage}
					/>
				) : null}

				{videos && videos?.length > 0 ? (
					<VideosContainer data={videos} movieId={id} />
				) : null}
			</div>
			{modalImage ? (
				<>
					<Modal
						bodyType={"image"}
						mediaSource={modalImage}
						closeModal={changeModalImage}
					/>
				</>
			) : null}
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
