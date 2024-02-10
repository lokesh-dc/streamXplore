import React, { ReactElement } from "react";
import getTvSeriesDetails from "@/dataFetchings/getTVSeriesDetails";
import { seriesDetails } from "@/constants/typescript";
import HeroSection from "@/components/ui/detail/HeroSection";
import PosterImage from "@/components/ui/detail/PosterImage";
import IntroSection from "@/components/ui/detail/IntroSection";

import VideosContainer from "@/components/functional-components/VideoContainer";
import Image from "next/image";

import { getImageBaseLink } from "@/constants";
import { AiTwotoneStar } from "react-icons/ai";
import ImagesModalContainer from "@/components/functional-components/ImagesModalContainer";
import path from "path";
import Head from "next/head";

const Movie: React.FC<seriesDetails> = ({
	id,
	adult,
	backdrop_path,
	poster_path,
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
	// revenue,
	runtime,
	tagline,
	title,
	vote_average,
	vote_count,
	backdrops,
	// logos,
	videos,
	details,
	seasons,
	last_episode_to_air,
}): ReactElement => {
	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>
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
					pageType={"tv-series"}
				/>

				{last_episode_to_air ? (
					<div className="flex flex-col gap-2 border-dashed  border-2 border-gray-300 bg-gray-50 p-2">
						<div className="flex justify-between md:justify-start gap-7 items-center">
							<h2 className="py-1 text-2xl uppercase">Latest Episode</h2>
							<p>{last_episode_to_air?.air_date}</p>
						</div>
						<div className="flex flex-col md:flex-row gap-3 p-2 w-fit">
							<div className="w-full md:w-1/3">
								<Image
									src={getImageBaseLink({
										path: last_episode_to_air?.still_path,
										type: "still",
										quality: "",
									})}
									width={450}
									height={100}
									alt=""
								/>
							</div>
							<div className="w-full md:w-2/3">
								<div className="flex gap-2 items-center">
									{last_episode_to_air?.episode_type == "finale" ? (
										<p className="bg-orange-300 w-min px-2 py-1">FINALE</p>
									) : null}
									<p>
										S{last_episode_to_air?.season_number}.E
										{last_episode_to_air?.episode_number}
									</p>
								</div>
								<h3 className="text-xl md:text-2xl">
									{last_episode_to_air?.name}
								</h3>
								<p className="text-gray-500 w-full md:w-1/2">
									{last_episode_to_air?.overview}
								</p>
							</div>
						</div>
					</div>
				) : null}

				{seasons && seasons?.length ? (
					<div className="flex flex-col gap-1">
						<h2 className="py-1 text-2xl uppercase">Seasons</h2>
						<div className="flex gap-3 border-grey overflow-x-auto">
							{seasons?.map((item, index) => (
								<div key={index} className="scrolling_seasons_cards">
									<Image
										src={getImageBaseLink({
											path: item?.poster_path,
											type: "poster",
											quality: "xl",
										})}
										width={150}
										height={200}
										alt=""
									/>
									<div>
										<p className="text-sm text-orange-700 flex items-center gap-1">
											<AiTwotoneStar />
											{item?.vote_average}/10
										</p>
										<h3>
											{item?.name?.length > 14
												? `${item?.name?.substring(0, 14)}...`
												: item?.name}{" "}
											({item?.episode_count})
										</h3>
									</div>
									{/* <p> Released on : {item?.air_date}</p> */}
								</div>
							))}
						</div>
					</div>
				) : null}
				<ImagesModalContainer backdrops={backdrops} title="title" />
				<VideosContainer data={videos} movieId={id} />
			</div>
		</>
	);
};
export default Movie;

export async function getServerSideProps(context: any) {
	const { id } = context.query;
	const details = await getTvSeriesDetails(id);
	if (details?.adult) {
		return {
			redirect: {
				destination: "/popular",
				permanent: true,
			},
		};
	}

	const {
		adult = null,
		backdrop_path = null,
		poster_path = null,
		budget = null,
		genres = null,
		homepage = null,
		imdb_id = null,
		original_language = null,
		original_title = null,
		overview = null,
		popularity = null,
		production_companies = null,
		production_countries = null,
		last_air_date = null,
		revenue = null,
		episode_run_time = null,
		tagline = null,
		name = null,
		vote_average = null,
		vote_count = null,
		images,
		videos,
		seasons,
		last_episode_to_air = null,
	} = details;

	const { backdrops, posters, logos } = images;
	const { results } = videos;
	return {
		props: {
			data: "abcd",
			id,
			adult,
			backdrop_path,
			poster_path,
			// budget,
			genres,
			homepage,
			imdb_id,
			original_language,
			original_title,
			overview,
			popularity,
			production_companies,
			production_countries,
			release_date: last_air_date,
			revenue,
			runtime:
				episode_run_time && episode_run_time?.length
					? episode_run_time[0]
					: null,
			tagline,
			title: name,
			vote_average,
			vote_count,
			details,
			logos,
			backdrops: backdrops || [],
			videos: results,
			seasons,
			last_episode_to_air,
		},
	};
}
