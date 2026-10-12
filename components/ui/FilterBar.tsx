"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi";

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
	resultCount?: number | null;
}

interface SelectProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<{ label: string; value: string }>;
}

const Select = ({ label, value, onChange, options }: SelectProps) => (
	<div className="relative inline-flex items-center">
		<select
			aria-label={label}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="cursor-pointer appearance-none rounded-full border border-white/10 bg-white/[0.04] py-2 pl-4 pr-9 text-xs font-medium text-text-primary transition-colors hover:border-white/25 focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&>option]:bg-[#151515] [&>option]:text-text-primary">
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
		<FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary" />
	</div>
);

const FilterBar = ({
	mediaType,
	genres = [],
	initialGenre = "",
	initialYear = "",
	initialSort = "",
	resultCount,
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

	const genreOptions = [
		{ label: "All Genres", value: "" },
		...genres.map((genre) => ({ label: genre.name, value: String(genre.id) })),
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

	return (
		<div className="shell sticky top-[calc(var(--nav-h,72px)_+_10px)] z-40">
			<div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#121110]/80 px-3 py-2.5 backdrop-blur-xl">
					<span className="eyebrow hidden items-center gap-1.5 sm:inline-flex">
						<FiFilter className="text-primary" />
						Filters
					</span>
					<span className="hidden h-5 w-px bg-white/10 sm:block" />

					<Select
						label="Filter by genre"
						value={initialGenre}
						onChange={(value) => apply({ genre: value })}
						options={genreOptions}
					/>
					<Select
						label="Filter by era"
						value={initialYear}
						onChange={(value) => apply({ year: value })}
						options={YEAR_OPTIONS}
					/>
					<Select
						label="Sort results"
						value={initialSort || "popularity.desc"}
						onChange={(value) => apply({ sort: value })}
						options={sortOptions}
					/>

					<div className="ml-auto flex items-center gap-3 pl-2">
						{resultCount ? (
							<span className="tabular hidden text-xs text-text-secondary md:inline">
								{resultCount.toLocaleString()} titles
							</span>
						) : null}

						{hasFilters && (
							<button
								onClick={() => apply({ genre: "", year: "", sort: "" })}
								className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
								<FiX />
								Clear
							</button>
						)}
					</div>
				</div>
			</div>
	);
};

export default FilterBar;
