import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactElement } from "react";
import { FaArrowRight } from "react-icons/fa";

import getTrendingMovies from "@/dataFetchings/trendingMovies";
import getTrendingSeries from "@/dataFetchings/trendingSeries";
import SectionHeader from "@/components/ui/SectionHeader";
import { decorateLink } from "@/utils";

export const metadata = {
	title: "Scene missing",
};

/** Fine diagonal hatch for the empty frame — reads as intentionally blank, not broken. */
const EMPTY_FRAME: CSSProperties = {
	backgroundImage:
		"repeating-linear-gradient(45deg, transparent 0 7px, rgba(230,80,27,0.07) 7px 8px)",
};

const toFrames = (list: unknown, fallbackType: string) =>
	(Array.isArray(list) ? list : [])
		.filter((item: Record<string, unknown>) => Boolean(item?.poster_path))
		.slice(0, 6)
		.map((item: Record<string, any>) => ({
			id: item.id,
			mediaType: item.media_type || fallbackType,
			title: (item.title || item.name || "").toString(),
			posterPath: item.poster_path as string,
			year: String(item.release_date || item.first_air_date || "").slice(0, 4),
		}));

/** Caption meta: "Movie · 2026" / "Series · 2025". Uppercased by the eyebrow class. */
const metaFor = (frame: { mediaType: string; year: string }) => {
	const kind = frame.mediaType === "movie" ? "Movie" : "Series";
	return frame.year ? `${kind} · ${frame.year}` : kind;
};

export default async function NotFound(): Promise<ReactElement> {
	const [movies, series] = await Promise.all([
		getTrendingMovies(),
		getTrendingSeries(),
	]);

	const a = toFrames(movies?.data, "movie");
	const b = toFrames(series?.data, "tv");

	const frames: typeof a = [];
	for (let i = 0; i < 3; i += 1) {
		if (a[i]) frames.push(a[i]);
		if (b[i]) frames.push(b[i]);
	}

	// Six real titles with the missing frame spliced dead-centre (3 | 404 | 3).
	const posters = frames.filter((frame) => frame.title).slice(0, 6);
	const mid = Math.floor(posters.length / 2);
	const slots: (typeof posters[number] | null)[] = [
		...posters.slice(0, mid),
		null,
		...posters.slice(mid),
	];

	return (
		<main className="shell flex min-h-[100dvh] flex-col justify-center gap-12 py-28 sm:gap-16">
			<section className="flex max-w-2xl flex-col gap-6">
				<h1 className="font-display text-[clamp(3.5rem,13vw,8.5rem)] text-text-primary">
					<span className="block">Scene</span>
					<span className="block">missing</span>
				</h1>

				<p className="max-w-md text-base text-text-secondary">
					The page you&apos;re looking for was moved, renamed, or
					never existed.
				</p>

				<div className="flex flex-wrap gap-3 pt-2">
					<Link
						href="/"
						className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-primary px-6 text-base font-medium text-[#0a0908] transition-all duration-200 ease-smooth hover:brightness-110 active:scale-[0.99]">
						Back to home
						<FaArrowRight className="h-3.5 w-3.5" aria-hidden />
					</Link>

					<Link
						href="/movies"
						className="inline-flex h-12 items-center justify-center rounded-md border border-white/[0.15] px-6 text-base font-medium text-text-primary transition-colors duration-200 ease-smooth hover:border-primary/50 hover:text-accent">
						Browse movies
					</Link>
				</div>
			</section>

			<section className="flex flex-col gap-6">
				<div className="hairline" />

				<SectionHeader
					eyebrow="Trending today"
					title="Watch these instead"
				/>

				<ul
					aria-label="Trending titles you can browse instead"
					className="flex gap-4 overflow-x-auto -m-1 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{slots.map((frame, index) =>
						frame == null ? (
							<li
								key="missing-frame"
								className="flex-1 basis-0 min-w-[150px] max-w-[240px]">
								<div
									style={EMPTY_FRAME}
									className="flex aspect-[2/3] items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
									<span className="font-display text-5xl text-accent">
										404
									</span>
								</div>
								<div className="mt-3 flex flex-col gap-1">
									<span className="block truncate text-sm text-text-secondary">
										Missing scene
									</span>
									<span className="eyebrow block truncate">
										Not found
									</span>
								</div>
							</li>
						) : (
							<li
								key={`${frame.mediaType}-${frame.id}-${index}`}
								className="flex-1 basis-0 min-w-[150px] max-w-[240px]">
								<Link
									href={`/${frame.mediaType}/${decorateLink(
										frame.title
									)}/${frame.id}`}
									className="group block focus-visible:outline-none">
									<span className="relative block aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-white/[0.04] ring-primary/60 ring-offset-2 ring-offset-bg-main transition-all duration-300 ease-smooth group-hover:border-primary/40 group-focus-visible:ring-2">
										<Image
											src={`https://image.tmdb.org/t/p/w342${frame.posterPath}`}
											alt={`${frame.title} poster`}
											fill
											sizes="(min-width: 1024px) 190px, (min-width: 640px) 170px, 150px"
											className="object-cover transition-transform duration-300 ease-smooth group-hover:scale-[1.05]"
										/>
									</span>
									<span className="mt-3 flex flex-col gap-1">
										<span className="block truncate text-sm text-text-primary transition-colors duration-200 ease-smooth group-hover:text-accent">
											{frame.title}
										</span>
										<span className="eyebrow block truncate">
											{metaFor(frame)}
										</span>
									</span>
								</Link>
							</li>
						)
					)}
				</ul>
			</section>
		</main>
	);
}
