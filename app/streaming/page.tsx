import { Metadata } from "next";

import discoverMovies from "@/dataFetchings/discoverMovies";
import discoverTV from "@/dataFetchings/discoverTV";
import getMoviesGenres from "@/dataFetchings/getMoviesGenres";
import getTVGenres from "@/dataFetchings/getTVGenres";
import {
	getWatchProviderRegions,
	getWatchProviders,
} from "@/dataFetchings/getWatchProviders";
import PageTitle from "@/components/ui/PageTitle";
import StreamingBrowser from "@/components/ui/streaming/StreamingBrowser";
import {
	AVAILABILITY_OPTIONS,
	DEFAULT_WATCH_REGION,
	STREAMING_SORT_OPTIONS,
	type AvailabilityValue,
	type StreamingSort,
} from "@/constants/streaming";

interface PageProps {
	searchParams: Promise<{
		region?: string;
		provider?: string;
		type?: string;
		genre?: string;
		sort?: string;
		availability?: string;
	}>;
}

export const metadata: Metadata = {
	title: "Streaming",
	description:
		"Explore movies and series on Netflix, Prime Video and other streaming services in your region.",
	alternates: {
		canonical: "/streaming",
	},
};

const SORT_VALUES = new Set<string>(
	STREAMING_SORT_OPTIONS.map((option) => option.value),
);
const AVAILABILITY_VALUES = new Set<string>(
	AVAILABILITY_OPTIONS.map((option) => option.value),
);

const StreamingPage = async ({ searchParams }: PageProps) => {
	const search = await searchParams;

	const requestedRegion = (
		search.region || DEFAULT_WATCH_REGION
	).toUpperCase();
	let region = /^[A-Z]{2}$/.test(requestedRegion)
		? requestedRegion
		: DEFAULT_WATCH_REGION;

	let [providers, regions] = await Promise.all([
		getWatchProviders(region),
		getWatchProviderRegions(),
	]);

	// A country can exist without provider data, or the API can return an
	// empty catalogue. Fall back once so the page still has something useful.
	if (!providers.length && region !== DEFAULT_WATCH_REGION) {
		region = DEFAULT_WATCH_REGION;
		providers = await getWatchProviders(region);
	}

	if (!providers.length) {
		return (
			<>
				<PageTitle
					title="Streaming"
					eyebrow="Browse by service"
					description="See what is available to stream in your region."
				/>
				<section className="shell pb-24">
					<p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-text-secondary">
						Streaming availability is unavailable right now. Please try
						again in a minute.
					</p>
				</section>
			</>
		);
	}

	const requestedProvider = Number(search.provider);
	const provider =
		providers.find(
			(item) => item.provider_id === requestedProvider,
		) ?? providers[0];

	const mediaType = search.type === "tv" ? "tv" : "movie";
	const genre = /^\d+$/.test(search.genre || "")
		? search.genre || ""
		: "";

	const sort =
		search.sort && SORT_VALUES.has(search.sort)
			? (search.sort as StreamingSort)
			: "popularity.desc";

	const availability =
		search.availability && AVAILABILITY_VALUES.has(search.availability)
			? (search.availability as AvailabilityValue)
			: "included";

	const availabilityOption =
		AVAILABILITY_OPTIONS.find((option) => option.value === availability) ??
		AVAILABILITY_OPTIONS[0];

	const sortBy =
		sort === "newest"
			? mediaType === "tv"
				? "first_air_date.desc"
				: "primary_release_date.desc"
			: sort;

	const [data, genresResult] = await Promise.all([
		(async () => {
			const load = () =>
				mediaType === "tv"
					? discoverTV({
							page: 1,
							genre: genre || undefined,
							sort_by: sortBy,
							watchProvider: provider.provider_id,
							watchRegion: region,
							monetization: availabilityOption.apiValue,
						})
					: discoverMovies({
							page: 1,
							genre: genre || undefined,
							sort_by: sortBy,
							watchProvider: provider.provider_id,
							watchRegion: region,
							monetization: availabilityOption.apiValue,
						});

			const first = await load();
			// TMDB occasionally drops a connection during discovery. One retry
			// keeps a transient reset from looking like an empty catalogue.
			return first?.error ? await load() : first;
		})(),
		mediaType === "tv" ? getTVGenres() : getMoviesGenres(),
	]);

	const regionLabel =
		regions.find((item) => item.iso_3166_1 === region)?.english_name ||
		region;

	return (
		<StreamingBrowser
			providers={providers}
			regions={regions}
			region={region}
			regionLabel={regionLabel}
			provider={provider}
			mediaType={mediaType}
			genre={genre}
			sort={sort}
			availability={availability}
			genres={genresResult?.data || []}
			initialData={Array.isArray(data?.data) ? data.data : []}
			totalPages={data?.totalPages || 1}
			totalResults={data?.raw?.total_results ?? null}
			loadFailed={Boolean(data?.error)}
		/>
	);
};

export default StreamingPage;
