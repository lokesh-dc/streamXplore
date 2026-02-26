import getPopularMovies from "@/dataFetchings/popularMovies";
import getMoviesPlayingInThetres from "@/dataFetchings/nowPlayingIntheatres";

import HeroSection from "@/components/HeroSection";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import { normalizeMovie } from "@/utils/genres";

import trendingMovies from "@/dataFetchings/trendingMovies";
import trendingSeries from "@/dataFetchings/trendingSeries";
import MovieContainer from "@/components/containers/SwiperMovieContainer";

export const metadata = {
	title: "MovieSearch - Your Ultimate Movie & TV Guide",
	description: "Discover trending movies and TV series, search for your favorites, and get recommendations.",
};

export default async function HomePage() {
	const pageData = await getPageDetails();
	const { popular = {}, nowPlaying = {}, trending, trendingTV } = pageData;

	return (
		<>
			<div className="flex flex-col gap-4">
				<HeroSection data={nowPlaying?.data} />
				{/* <div className="flex flex-col gap-4 px-4 my-4">
					<div className="flex flex-col gap-3">
						<div className="flex justify-between">
							<h2>Trending Now</h2>
							<Button
								size="sm"
								variant="secondary"
								rightIcon={<FaArrowRight />}>
								See More
							</Button>
						</div>

						<div className="scrollableSection flex gap-4">
							{popular?.data?.map((item, ind) => (
								<div className="rounded-md flex flex-col gap-2" key={ind}>
									<Image
										className="inset-0 h-full w-full object-cover rounded-md"
										src={getImageBaseLink({
											type: "poster",
											quality: "lg",
											path: item?.backdrop_path,
										})}
										alt=""
										height={200}
										width={300}
									/>
									<p>{item?.title}</p>
								</div>
							))}
						</div>
					</div>
				</div> */}

				<MovieContainer
					data={popular?.data}
					title="Popular this week"
					showType="movie"
				/>

				<MovieContainer
					data={nowPlaying?.data}
					title="Now Playing in Thatres"
					showType="movie"
				/>
				<MovieContainer
					data={trending?.data}
					title="Trending Movies"
					showType="movie"
				/>
				<MovieContainer
					data={trendingTV?.data}
					title="Trending TV Series"
					showType="tv"
				/>
			</div>
		</>
	);
}

export async function getPageDetails() {
	const [popular, nowPlaying, movieGenres, trending, trendingTV] =
		await Promise.all([
			getPopularMovies(1),
			getMoviesPlayingInThetres(1),
			getMoviesGenres(),
			trendingMovies(),
			trendingSeries(),
		]);

	const data = normalizeMovie(popular?.data, movieGenres?.data);
	return {
		popular: {
			...popular,
			data: normalizeMovie(popular?.data, movieGenres?.data),
		},
		nowPlaying: {
			...nowPlaying,
			data: normalizeMovie(nowPlaying?.data, movieGenres?.data),
		},
		trending: {
			...trending,
			data: normalizeMovie(trending?.data, movieGenres?.data),
		},
		trendingTV: trendingTV || null,
	};
}
