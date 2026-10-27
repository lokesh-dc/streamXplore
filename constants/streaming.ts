/** Defaults for streaming-service discovery. */
export const DEFAULT_WATCH_REGION = "IN";

/** Cookie used to carry the selected region onto title pages. */
export const REGION_COOKIE = "hom_watch_region";

export type AvailabilityValue = "included" | "free" | "rent" | "all";

export const AVAILABILITY_OPTIONS: Array<{
	value: AvailabilityValue;
	label: string;
	apiValue: string;
}> = [
	{
		value: "included",
		label: "Included with subscription",
		apiValue: "flatrate",
	},
	{ value: "free", label: "Free to watch", apiValue: "free,ads" },
	{ value: "rent", label: "Rent or buy", apiValue: "rent,buy" },
	{ value: "all", label: "All availability", apiValue: "" },
];

export const STREAMING_SORT_OPTIONS = [
	{ value: "popularity.desc", label: "Most Popular" },
	{ value: "vote_average.desc", label: "Top Rated" },
	{ value: "newest", label: "Newest First" },
] as const;

export type StreamingSort =
	(typeof STREAMING_SORT_OPTIONS)[number]["value"];
