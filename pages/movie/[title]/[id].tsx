import React, { ReactElement } from "react";
import getMovieDetails from "@/data/getMovieDetails";
import { movieDetailsPage } from "@/constants/typescript";
import HeroSection from "@/components/ui/detail/HeroSection";
import IntroSection from "@/components/ui/detail/IntroSection";
import PosterImage from "@/components/ui/detail/PosterImage";
// import MovieImages from "@/components/containers/MovieImages";

import dynamic from "next/dynamic";
import VideosContainer from "@/components/containers/VideosContainer";
import Head from "next/head";
import { useRouter } from "next/router";

import share from "@/public/share.png";
import Image from "next/image";

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
	const router = useRouter();
	const currentPath = `https://www.hexahealth.com${router?.asPath}`;
	const shareIntent = async () => {
		const shareData = {
			url: `${currentPath}`,
		};
		if (navigator?.share) {
			// if (navigator?.canShare && navigator?.canShare()) {
			try {
				await navigator?.share(shareData);
				console.log("shared");
			} catch (error) {
				// @ts-ignore
				console.log(`Error: ${error.message}`);
			}
			// } else {
			// 	console.log(`Your system doesn't support sharing these files.`);
			// }
		} else {
			console.log("Share is not present in navigator");
		}
	};

	return (
		<>
			<Head>
				<title>{original_title}</title>
			</Head>
			<HeroSection
				backdrop_path={backdrop_path || poster_path}
				title={title}
				logos={logos}
			/>
			<div className="flex flex-col gap-2 pb-5 default_screen_padding">
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
			<div className="" onClick={shareIntent}>
				<Image src={share} width={30} height={30} alt="" /> Share Intent
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
