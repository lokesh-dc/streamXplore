import React, { ReactElement } from "react";
import getMovieDetails from "@/dataFetchings/getMovieDetails";
import { movieDetailsPage } from "@/constants/typescript";
import HeroSection from "@/components/ui/detail/HeroSection";
import IntroSection from "@/components/ui/detail/IntroSection";
import PosterImage from "@/components/ui/detail/PosterImage";

import VideosContainer from "@/components/functional-components/VideoContainer";
import Head from "next/head";
import ImagesModalContainer from "@/components/functional-components/ImagesModalContainer";
import MoviesContainer from "@/components/containers/MoviesContainer";

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
	recommendations,
}): ReactElement => {
	return (
		<>
			<Head>
				<title>{original_title}</title>
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
				/>
				<ImagesModalContainer backdrops={backdrops} title="title" />
				<VideosContainer data={videos} movieId={id} />
				{/* {recommendations?.total_results ? (
					<div className="flex flex-col gap-5">
						<h2 className="py-1 text-2xl uppercase">Recommendations </h2>
						<div className="flex gap-x-3 gap-y-6 justify-start flex-wrap">
							{recommendations?.results?.map((movieItem, index) => {
								if (!movieItem?.poster_path || !movieItem?.backdrop_path)
									return null;

								return (
									<Link
										key={index}
										href={`/${movieItem?.media_type}/${decorateLink(
											movieItem?.original_title
										)}/${movieItem?.id}`}
									>
										<div
											className="flex flex-col gap-1"
											style={{
												width: "215px",
												border: "1px solid rgba(0,0,0,0.1)",
												padding: "5px",
											}}
										>
											<MovieCardImage
												imgSrc={movieItem?.poster_path}
												title={movieItem?.name}
												position={undefined}
												stateChange={() => console.log()}
											/>
											<div className="flex justify-between">
												<p className="text-orange-600 flex gap-1 items-center">
													<AiTwotoneStar />
													{movieItem?.vote_average?.toFixed(1)} / 10
												</p>
												{movieItem?.release_date ? (
													<p className="text-grey-100">
														{movieItem?.release_date?.split("-")[0]}
													</p>
												) : null}
											</div>
											<h3>{movieItem?.title}</h3>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				) : null} */}
				<MoviesContainer
					data={recommendations?.results}
					title="Recommendations"
				/>
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
		recommendations,
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
			recommendations,
		},
	};
}
