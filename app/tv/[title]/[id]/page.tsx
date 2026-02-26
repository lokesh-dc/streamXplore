import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";

import getTvSeriesDetails from "@/dataFetchings/getTVSeriesDetails";
import HeroSection from "@/components/ui/detail/HeroSection";
import PosterImage from "@/components/ui/detail/PosterImage";
import IntroSection from "@/components/ui/detail/IntroSection";
import VideosContainer from "@/components/functional-components/VideoContainer";
import ImagesModalContainer from "@/components/functional-components/ImagesModalContainer";
import SeasonsContainer from "@/components/containers/SeasonsContianer";
import { getImageBaseLink } from "@/constants";

interface PageProps {
	params: Promise<{
		title: string;
		id: string;
	}>;
}

/**
 * Fetches and transforms TV series details for the server component.
 */
async function getPageData(id: string) {
	const details = await getTvSeriesDetails(id);

	if (!details || details.success === false) return null;

	if (details.adult) {
		redirect("/popular");
	}

	const {
		backdrop_path = null,
		poster_path = null,
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
		episode_run_time = null,
		tagline = null,
		name = null,
		vote_average = null,
		vote_count = null,
		images = { backdrops: [], posters: [], logos: [] },
		videos = { results: [] },
		seasons = [],
		last_episode_to_air = null,
		next_episode_to_air = null,
	} = details;

	const { backdrops, logos } = images;
	const { results: videosResults } = videos;

	return {
		id,
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
		release_date: last_air_date,
		runtime: episode_run_time?.[0] || null,
		tagline,
		title: name,
		vote_average,
		vote_count,
		details,
		logos,
		backdrops: backdrops || [],
		videos: videosResults || [],
		seasons,
		last_episode_to_air,
		next_episode_to_air,
	};
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { title } = await params;
	return {
		title: decodeURIComponent(title),
	};
}

const TVSeriesPage = async ({ params }: PageProps) => {
	const { id } = await params;
	const data = await getPageData(id);

	if (!data) {
		return <div className="p-10 text-center">Series not found</div>;
	}

	const {
		title,
		backdrop_path,
		poster_path,
		release_date,
		runtime,
		overview,
		vote_average,
		tagline,
		genres,
		last_episode_to_air,
		next_episode_to_air,
		seasons,
		backdrops,
		videos,
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
					pageType={"tv-series"}
				/>

				{last_episode_to_air && (
					<div className="flex flex-col gap-2 border-dashed border-2 border-gray-300 bg-gray-50 p-2">
						<div className="flex justify-between md:justify-start gap-7 items-center">
							<h2 className="py-1 text-2xl uppercase">Latest Episode</h2>
							<p>{last_episode_to_air.air_date}</p>
						</div>
						<div className="flex flex-col md:flex-row gap-3 p-2 w-fit">
							<div className="w-full md:w-1/3">
								<Image
									src={getImageBaseLink({
										path: last_episode_to_air.still_path,
										type: "still",
										quality: "",
									})}
									width={450}
									height={100}
									alt={last_episode_to_air.name || "Latest Episode"}
								/>
							</div>
							<div className="w-full md:w-2/3">
								<div className="flex gap-2 items-center">
									{last_episode_to_air.episode_type === "finale" && (
										<p className="bg-orange-300 w-min px-2 py-1">FINALE</p>
									)}
									<p>
										S{last_episode_to_air.season_number}.E
										{last_episode_to_air.episode_number}
									</p>
								</div>
								<h3 className="text-xl md:text-2xl">{last_episode_to_air.name}</h3>
								<p className="text-gray-500 w-full md:w-3/4">
									{last_episode_to_air.overview}
								</p>
							</div>
						</div>
					</div>
				)}

				{next_episode_to_air && (
					<div className="flex flex-col gap-2 border-dashed border-2 border-gray-300 bg-gray-50 p-2">
						<div className="flex justify-between md:justify-start gap-7 items-center">
							<h2 className="py-1 text-2xl uppercase">Next Episode to air</h2>
							<p>{next_episode_to_air.air_date}</p>
						</div>
						<div className="flex flex-col md:flex-row gap-3 p-2 w-fit">
							{next_episode_to_air.still_path && (
								<div className="w-full md:w-1/3">
									<Image
										src={getImageBaseLink({
											path: next_episode_to_air.still_path,
											type: "still",
											quality: "",
										})}
										width={450}
										height={100}
										alt={next_episode_to_air.name || "Next Episode"}
									/>
								</div>
							)}
							<div className="w-full md:w-2/3">
								<div className="flex gap-2 items-center">
									{next_episode_to_air.episode_type === "finale" && (
										<p className="bg-orange-300 w-min px-2 py-1">FINALE</p>
									)}
									<p>
										S{next_episode_to_air.season_number}.E
										{next_episode_to_air.episode_number}
									</p>
								</div>
								<h3 className="text-xl md:text-2xl">{next_episode_to_air.name}</h3>
								<p className="text-gray-500 w-full md:w-3/4">
									{next_episode_to_air.overview}
								</p>
							</div>
						</div>
					</div>
				)}

				<SeasonsContainer data={seasons} seriesId={id} />
				<ImagesModalContainer backdrops={backdrops} title={title} />
				<VideosContainer data={videos} movieId={id} />
			</div>
		</>
	);
};

export default TVSeriesPage;
