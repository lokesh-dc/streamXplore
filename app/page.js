import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

import getPopularMovies from "@/dataFetchings/popularMovies";
import HeroSection from "@/components/HeroSection";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import getTVGenres from "@/dataFetchings/getTVGenres";
import { normalizeMovie, normalizeTV } from "@/utils/genres";

import trendingMovies from "@/dataFetchings/trendingMovies";
import trendingSeries from "@/dataFetchings/trendingSeries";
import MovieContainer from "@/components/containers/SwiperMovieContainer";
import MotionPage from "@/components/layout/MotionPage";
import AiBanner from "@/components/ui/home/AiBanner";

export const metadata = {
	title: "HookedOnMovies - Your Ultimate Movie & TV Guide",
	description:
		"Discover trending movies and TV series, search for your favorites, and get recommendations.",
};

export default async function HomePage() {
	const pageData = await getPageDetails();
	const { popular = {}, trending, trendingTV } = pageData;

	// Combine trending movies and TV for hero section
	const heroData = [
		...(trending?.data?.slice(0, 5) || []),
		...(trendingTV?.data?.slice(0, 5) || []),
	].sort(() => Math.random() - 0.5);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "HookedOnMovies",
		url: "https://hookedonmovies-app.vercel.app",
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate:
					"https://hookedonmovies-app.vercel.app/search?q={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<MotionPage className="flex flex-col">
				<HeroSection data={heroData} />

				<AiBanner
					posters={[...(trending?.data || []), ...(trendingTV?.data || [])]
						.map((item) => item?.poster_path)
						.filter(Boolean)
						.slice(0, 3)}
				/>

				<div className="flex flex-col pb-16 pt-6">
					<MovieContainer
						data={popular?.data}
						title="Popular this week"
						subtitle="What audiences are watching right now."
						showType="movie"
						index={1}
					/>

					<MovieContainer
						data={trending?.data}
						title="Trending movies"
						subtitle="The films climbing fastest across the day."
						showType="movie"
						index={2}
					/>

					<MovieContainer
						data={trendingTV?.data}
						title="Trending series"
						subtitle="Shows everyone is bingeing right now."
						showType="tv"
						index={3}
					/>
				</div>

				<section className="shell pb-28 pt-4">
					<div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0d0c] px-8 py-14 md:px-16 md:py-20">
						<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
						<div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
							<div className="flex max-w-xl flex-col gap-4">
								<span className="eyebrow">The whole library</span>
								<h2 className="font-display text-balance text-5xl leading-[0.95] md:text-6xl">
									Find your next obsession
								</h2>
								<p className="text-sm leading-relaxed text-text-secondary">
									Browse thousands of films and series by genre, era and rating —
									or ask the assistant for a recommendation.
								</p>
							</div>

							<div className="flex flex-wrap gap-3">
								<Link
									href="/movies"
									className="group inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
									Browse movies
									<FaArrowRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
								</Link>
								<Link
									href="/tv-series"
									className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
									Browse series
								</Link>
							</div>
						</div>
					</div>
				</section>
			</MotionPage>
		</>
	);
}

export async function getPageDetails() {
	const [popular, movieGenres, trending, trendingTV, tvGenres] =
		await Promise.all([
			getPopularMovies(1),
			getMoviesGenres(),
			trendingMovies(),
			trendingSeries(),
			getTVGenres(),
		]);

	return {
		popular: {
			...popular,
			data: normalizeMovie(popular?.data, movieGenres?.data),
		},
		trending: {
			...trending,
			data: normalizeMovie(trending?.data, movieGenres?.data),
		},
		trendingTV: {
			...trendingTV,
			data: normalizeTV(trendingTV?.data, tvGenres?.data),
		},
	};
}
