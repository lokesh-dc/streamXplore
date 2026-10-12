"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiFilter, FiX } from "react-icons/fi";

const YEAR_OPTIONS = [
	{ label: "Any Year", value: "" },
	{ label: "2020s", value: "2020" },
	{ label: "2010s", value: "2010" },
	{ label: "2000s", value: "2000" },
	{ label: "1990s", value: "1990" },
];

interface FilterBarProps {
	mediaType: "movie" | "tv";
	genres: Array<{ id: number; name: string }>;
	initialGenre?: string;
	initialYear?: string;
	initialSort?: string;
}

const FilterBar = ({
	mediaType,
	genres = [],
	initialGenre = "",
	initialYear = "",
	initialSort = "",
}: FilterBarProps) => {
	const router = useRouter();
	const pathname = usePathname();

	const sortOptions = [
		{ label: "Most Popular", value: "popularity.desc" },
		{ label: "Top Rated", value: "vote_average.desc" },
		{
			label: "Newest First",
			value:
				mediaType === "tv"
					? "first_air_date.desc"
					: "primary_release_date.desc",
		},
	];

	const apply = (next: { genre?: string; year?: string; sort?: string }) => {
		const params = new URLSearchParams();
		const genre = next.genre ?? initialGenre;
		const year = next.year ?? initialYear;
		const sort = next.sort ?? initialSort;
		if (genre) params.set("genre", genre);
		if (year) params.set("year", year);
		if (sort && sort !== "popularity.desc") params.set("sort", sort);
		const qs = params.toString();
		router.push(qs ? `${pathname}?${qs}` : pathname);
	};

	const hasFilters = Boolean(initialGenre || initialYear || initialSort);

	const selectClass =
		"bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#E6501B]/60 cursor-pointer appearance-none [&>option]:bg-[#151515]";

	return (
		<div className="flex flex-wrap items-center gap-3 px-2 md:px-9 my-4">
			<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
				<FiFilter className="text-[#E6501B]" />
				Filters
			</span>

			<select
				aria-label="Filter by genre"
				value={initialGenre}
				onChange={(e) => apply({ genre: e.target.value })}
				className={selectClass}>
				<option value="">All Genres</option>
				{genres.map((genre) => (
					<option key={genre.id} value={genre.id}>
						{genre.name}
					</option>
				))}
			</select>

			<select
				aria-label="Filter by era"
				value={initialYear}
				onChange={(e) => apply({ year: e.target.value })}
				className={selectClass}>
				{YEAR_OPTIONS.map((year) => (
					<option key={year.value} value={year.value}>
						{year.label}
					</option>
				))}
			</select>

			<select
				aria-label="Sort results"
				value={initialSort}
				onChange={(e) => apply({ sort: e.target.value })}
				className={selectClass}>
				{sortOptions.map((sort) => (
					<option key={sort.value} value={sort.value}>
						{sort.label}
					</option>
				))}
			</select>

			{hasFilters && (
				<button
					onClick={() => apply({ genre: "", year: "", sort: "" })}
					className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
					<FiX />
					Clear
				</button>
			)}
		</div>
	);
};

export default FilterBar;