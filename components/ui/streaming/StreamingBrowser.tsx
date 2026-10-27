"use client";

import {
	useEffect,
	useRef,
	useState,
	useTransition,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiRefreshCw } from "react-icons/fi";

import GridMovieContainer from "@/components/containers/GridMovieContainer";
import ProviderLogo from "@/components/ui/streaming/ProviderLogo";
import StreamingHero from "@/components/ui/streaming/StreamingHero";
import {
	AVAILABILITY_OPTIONS,
	REGION_COOKIE,
	STREAMING_SORT_OPTIONS,
	type AvailabilityValue,
	type StreamingSort,
} from "@/constants/streaming";
import type { movieDetails } from "@/constants/typescript";
import type {
	WatchProvider,
	WatchRegion,
} from "@/dataFetchings/getWatchProviders";

type MediaType = "movie" | "tv";

interface StreamingBrowserProps {
	providers: WatchProvider[];
	regions: WatchRegion[];
	region: string;
	regionLabel: string;
	provider: WatchProvider;
	mediaType: MediaType;
	genre: string;
	sort: StreamingSort;
	availability: AvailabilityValue;
	genres: Array<{ id: number; name: string }>;
	initialData: movieDetails[];
	totalPages: number;
	totalResults: number | null;
	loadFailed?: boolean;
}

interface BrowserState {
	region: string;
	provider: string;
	mediaType: MediaType;
	genre: string;
	sort: StreamingSort;
	availability: AvailabilityValue;
}

const TYPE_OPTIONS = [
	{ value: "movie", label: "Movies" },
	{ value: "tv", label: "TV Series" },
] as const;

const AVAILABILITY_SHORT_LABELS: Record<AvailabilityValue, string> = {
	included: "Included",
	free: "Free",
	rent: "Rent / buy",
	all: "All",
};

const MAJOR_PROVIDER_NAMES = new Set([
	"netflix",
	"amazon prime video",
	"prime video",
	"disney+",
	"disney plus",
	"apple tv",
	"apple tv+",
	"jiohotstar",
	"hotstar",
	"jiocinema",
	"zee5",
	"sony liv",
	"sonyliv",
	"sun nxt",
	"mubi",
	"crunchyroll",
	"hoichoi",
	"aha",
	"lionsgate play",
	"discovery+",
	"max",
	"hbo max",
	"hulu",
	"paramount+",
	"paramount plus",
	"peacock",
	"starz",
	"showtime",
	"now",
	"sky go",
	"stan",
	"binge",
	"crave",
	"cbc gem",
	"britbox",
	"itvx",
	"channel 4",
	"u-next",
	"tving",
	"wavve",
	"watcha",
	"rakuten viki",
	"iqiyi",
	"wetv",
	"viu",
	"amazon mx player",
	"mx player",
	"tubi tv",
	"pluto tv",
	"plex",
	"freevee",
	"the roku channel",
	"kanopy",
	"hoopla",
	"star+",
]);

const isMajorProvider = (provider: WatchProvider) =>
	MAJOR_PROVIDER_NAMES.has(
		provider.provider_name.toLowerCase().replace(/\s+/g, " ").trim(),
	);

const InlineSelect = ({
	label,
	value,
	onChange,
	children,
	className = "",
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	children: ReactNode;
	className?: string;
}) => (
	<label className={`group flex min-w-0 items-center gap-2 ${className}`}>
		<span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
			{label}
		</span>
		<span className="relative inline-flex min-w-0 items-center">
			<select
				aria-label={label}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="max-w-[11rem] cursor-pointer appearance-none truncate bg-transparent pr-4 text-[11px] font-semibold text-white/80 transition-colors hover:text-white focus:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 [&>option]:bg-[#151515] [&>option]:text-white">
				{children}
			</select>
			<FiChevronDown className="pointer-events-none absolute right-0 text-[11px] text-white/35 transition-colors group-hover:text-white/70" />
		</span>
	</label>
);

const StreamingBrowser = ({
	providers,
	regions,
	region,
	regionLabel,
	provider,
	mediaType,
	genre,
	sort,
	availability,
	genres,
	initialData,
	totalPages,
	totalResults,
	loadFailed = false,
}: StreamingBrowserProps) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const stripRef = useRef<HTMLDivElement>(null);
	const selectedProviderRef = useRef<HTMLButtonElement>(null);
	const [canScrollRight, setCanScrollRight] = useState(false);

	// Keep the selected country when the visitor opens a title page.
	useEffect(() => {
		const secure = window.location.protocol === "https:" ? "; secure" : "";
		document.cookie = `${REGION_COOKIE}=${region}; path=/; max-age=31536000; samesite=lax${secure}`;
	}, [region]);

	useEffect(() => {
		const strip = stripRef.current;
		if (!strip) return;

		const updateHint = () =>
			setCanScrollRight(
				strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2,
			);

		updateHint();
		strip.addEventListener("scroll", updateHint, { passive: true });
		const observer = new ResizeObserver(updateHint);
		observer.observe(strip);

		return () => {
			strip.removeEventListener("scroll", updateHint);
			observer.disconnect();
		};
	}, [providers, provider.provider_id]);

	useEffect(() => {
		const strip = stripRef.current;
		const selected = selectedProviderRef.current;
		if (!strip || !selected) return;

		const left =
			selected.offsetLeft - strip.clientWidth / 2 + selected.clientWidth / 2;
		strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
	}, [provider.provider_id]);

	const buildHref = (overrides: Partial<BrowserState> = {}) => {
		const state: BrowserState = {
			region,
			provider: String(provider.provider_id),
			mediaType,
			genre,
			sort,
			availability,
			...overrides,
		};

		const params = new URLSearchParams();
		params.set("region", state.region);
		if (state.provider) params.set("provider", state.provider);
		if (state.mediaType !== "movie") params.set("type", state.mediaType);
		if (state.genre) params.set("genre", state.genre);
		if (state.sort !== "popularity.desc") params.set("sort", state.sort);
		if (state.availability !== "included") {
			params.set("availability", state.availability);
		}

		return `/streaming?${params.toString()}`;
	};

	const go = (overrides: Partial<BrowserState> = {}) =>
		startTransition(() => {
			router.push(buildHref(overrides), { scroll: false });
		});

	const featuredProviders = [...providers]
		.sort((a, b) => {
			const majorDelta =
				Number(isMajorProvider(b)) - Number(isMajorProvider(a));
			return (
				majorDelta ||
				a.display_priority - b.display_priority ||
				a.provider_name.localeCompare(b.provider_name)
			);
		})
		.slice(0, 10);

	if (
		!featuredProviders.some(
			(item) => item.provider_id === provider.provider_id,
		)
	) {
		featuredProviders.pop();
		featuredProviders.push(provider);
	}

	const availabilityOption =
		AVAILABILITY_OPTIONS.find((item) => item.value === availability) ??
		AVAILABILITY_OPTIONS[0];
	const sortOption =
		STREAMING_SORT_OPTIONS.find((item) => item.value === sort) ??
		STREAMING_SORT_OPTIONS[0];
	const mediaLabel = mediaType === "movie" ? "movies" : "series";
	const hasFilters =
		Boolean(genre) ||
		sort !== "popularity.desc" ||
		availability !== "included";

	const featured =
		initialData.find((item) => item.backdrop_path && item.overview) ||
		initialData[0] ||
		null;

	const absoluteSort =
		sort === "newest"
			? mediaType === "tv"
				? "first_air_date.desc"
				: "primary_release_date.desc"
			: sort;

	const filterKey = [
		region,
		provider.provider_id,
		mediaType,
		genre || "all",
		sort,
		availability,
	].join("-");

	return (
		<div className="pb-10">
			<StreamingHero
				provider={provider}
				regionLabel={regionLabel}
				mediaType={mediaType}
				availabilityLabel={availabilityOption.label}
				featured={featured}
				totalResults={totalResults}
			/>

			<section className="border-b border-white/10 bg-[#0d0c0b]">
				<div className="shell py-3">
					<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
						<div className="flex min-w-0 items-center gap-3">
							<span className="eyebrow hidden shrink-0 text-white/30 sm:inline">
								Channels
							</span>
							<div className="relative min-w-0 flex-1">
								<div
									ref={stripRef}
									className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
									{featuredProviders.map((item) => {
										const selected =
											item.provider_id === provider.provider_id;

										return (
											<button
												key={item.provider_id}
												ref={selected ? selectedProviderRef : undefined}
												type="button"
												onClick={() =>
													go({ provider: String(item.provider_id) })
												}
												aria-pressed={selected}
												className={`group relative flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
													selected
														? "bg-white/[0.045]"
														: "hover:bg-white/[0.03]"
												}`}>
												<ProviderLogo
													provider={item}
													size="xs"
													className={
														selected
															? ""
															: "opacity-55 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
													}
												/>
												<span
													className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
														selected
															? "text-white"
															: "text-white/45 group-hover:text-white/80"
													}`}>
													{item.provider_name}
												</span>
												<span
													className={`absolute inset-x-2 -bottom-px h-px transition-all duration-300 ${
														selected
															? "bg-primary"
															: "bg-transparent group-hover:bg-white/20"
													}`}
												/>
											</button>
										);
									})}
								</div>
								{canScrollRight ? (
									<div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0d0c0b] to-transparent" />
								) : null}
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-3 xl:border-0 xl:pt-0">
							<InlineSelect
								label="Region"
								value={region}
								onChange={(nextRegion) =>
									go({ region: nextRegion, provider: "" })
								}>
								{regions.map((item) => (
									<option key={item.iso_3166_1} value={item.iso_3166_1}>
										{item.english_name}
									</option>
								))}
							</InlineSelect>

							<InlineSelect
								label="All services"
								value={String(provider.provider_id)}
								onChange={(value) => go({ provider: value })}>
								{providers.map((item) => (
									<option key={item.provider_id} value={item.provider_id}>
										{item.provider_name}
									</option>
								))}
							</InlineSelect>
						</div>
					</div>
				</div>
			</section>

			<section
				id="catalogue"
				className="scroll-mt-24 pt-14 md:pt-20">
				<div className="shell">
					<div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
						<div className="min-w-0 max-w-4xl">
							<span className="eyebrow flex items-center gap-3">
								<span className="text-primary">01</span>
								The catalogue
							</span>
							<h2 className="mt-3 text-balance font-display text-5xl uppercase leading-[0.86] text-text-primary sm:text-6xl md:text-7xl xl:text-8xl">
								<span className="text-white/25">On</span>{" "}
								{provider.provider_name}
							</h2>
							<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
								<span>
									{totalResults != null
										? `${totalResults.toLocaleString("en-US")} ${mediaLabel}`
										: `Browse ${mediaLabel}`}
								</span>
								<span className="h-1 w-1 rounded-full bg-white/25" />
								<span>{regionLabel}</span>
								<span className="h-1 w-1 rounded-full bg-white/25" />
								<span>{AVAILABILITY_SHORT_LABELS[availability]}</span>
								<span className="h-1 w-1 rounded-full bg-white/25" />
								<span>{sortOption.label}</span>
							</div>
						</div>

						<div className="flex items-center gap-6 md:pb-1">
							{TYPE_OPTIONS.map((item) => {
								const active = mediaType === item.value;

								return (
									<button
										key={item.value}
										type="button"
										onClick={() =>
											go({ mediaType: item.value, genre: "" })
										}
										aria-pressed={active}
										className={`group relative pb-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:text-xs ${
											active
												? "text-white"
												: "text-white/30 hover:text-white/70"
										}`}>
										{item.label}
										<span
											className={`absolute inset-x-0 bottom-0 h-px transition-all duration-300 ${
												active
													? "bg-primary"
													: "bg-transparent group-hover:bg-white/25"
											}`}
										/>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<div className="mt-8 border-y border-white/10 bg-[#0a0908]/90 backdrop-blur-xl md:sticky md:top-[var(--nav-h,72px)] md:z-40 md:mt-10">
					<div className="shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-wrap items-center gap-x-7 gap-y-2">
							<InlineSelect
								label="Genre"
								value={genre}
								onChange={(value) => go({ genre: value })}>
								<option value="">All genres</option>
								{genres.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</InlineSelect>

							<InlineSelect
								label="Sort"
								value={sort}
								onChange={(value) =>
									go({ sort: value as StreamingSort })
								}>
								{STREAMING_SORT_OPTIONS.map((item) => (
									<option key={item.value} value={item.value}>
										{item.label}
									</option>
								))}
							</InlineSelect>

							<InlineSelect
								label="Availability"
								value={availability}
								onChange={(value) =>
									go({ availability: value as AvailabilityValue })
								}>
								{AVAILABILITY_OPTIONS.map((item) => (
									<option key={item.value} value={item.value}>
										{AVAILABILITY_SHORT_LABELS[item.value]}
									</option>
								))}
							</InlineSelect>

							{hasFilters ? (
								<button
									type="button"
									onClick={() =>
										go({
											genre: "",
											sort: "popularity.desc",
											availability: "included",
										})
									}
									className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
									Reset
								</button>
							) : null}
						</div>

						<a
							href="https://www.justwatch.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-white/60">
							Availability by JustWatch
						</a>
					</div>
				</div>

				<div className="shell pt-8 md:pt-10">
					{loadFailed ? (
						<div
							role="status"
							className="flex flex-col items-start gap-4 border-y border-white/10 py-16 md:items-center md:text-center">
							<span className="eyebrow text-primary">Connection issue</span>
							<p className="font-display text-4xl uppercase leading-none text-text-primary md:text-5xl">
								The catalogue didn&apos;t load
							</p>
							<p className="max-w-md text-sm leading-relaxed text-text-secondary">
								TMDB may be having a moment. Your filters are safe — try
								again in a second.
							</p>
							<button
								type="button"
								onClick={() => startTransition(() => router.refresh())}
								className="mt-1 inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
								<FiRefreshCw className="text-sm" />
								Try again
							</button>
						</div>
					) : (
						<div
							aria-busy={isPending}
							className={`transition-opacity duration-300 ${
								isPending ? "opacity-45" : "opacity-100"
							}`}>
							<GridMovieContainer
								key={filterKey}
								embedded
								upcoming={initialData}
								apiPath={`/discover/${mediaType}`}
								total={totalPages}
								showType={mediaType}
								filters={{
									genre,
									sort:
										sort === "popularity.desc"
											? undefined
											: absoluteSort,
									yearGte: null,
									watchProvider: String(provider.provider_id),
									watchRegion: region,
									monetization: availabilityOption.apiValue,
									basePath: buildHref({
										genre: "",
										sort: "popularity.desc",
										availability: "included",
									}),
								}}
							/>
						</div>
					)}
				</div>

				<div className="shell mt-4 flex flex-col gap-1 border-t border-white/10 py-8 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
					<span>
						Availability data by{" "}
						<a
							href="https://www.justwatch.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 transition-colors hover:text-white">
							JustWatch
						</a>
					</span>
					<span>
						{regionLabel} · Catalogues change often
					</span>
				</div>
			</section>
		</div>
	);
};

export default StreamingBrowser;
