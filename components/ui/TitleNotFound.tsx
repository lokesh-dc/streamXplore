import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

import RecoveryRail from "@/components/ui/RecoveryRail";

type NotFoundKind = "movie" | "tv" | "person";

interface KindCopy {
	/** Display noun — also drives the h1's first line. */
	label: string;
	body: string;
	ctaLabel: string;
	ctaHref: string;
}

const COPY: Record<NotFoundKind, KindCopy> = {
	movie: {
		label: "Movie",
		body: "We couldn't find this movie. The link may be wrong, or it's no longer in the catalog.",
		ctaLabel: "Browse movies",
		ctaHref: "/movies",
	},
	tv: {
		label: "Series",
		body: "We couldn't find this series. The link may be wrong, or it's no longer in the catalog.",
		ctaLabel: "Browse series",
		ctaHref: "/tv-series",
	},
	person: {
		label: "Person",
		body: "We couldn't find this person. The link may be wrong, or it's no longer in the catalog.",
		ctaLabel: "See what's popular",
		ctaHref: "/popular",
	},
};

interface TitleNotFoundProps {
	kind: NotFoundKind;
}

/**
 * 404 screen for a missing movie / series / person detail page.
 * Sits inside the segment's not-found boundary, so it renders with a real
 * 404 status (the pages call notFound() rather than returning a 200).
 */
const TitleNotFound = ({ kind }: TitleNotFoundProps) => {
	const copy = COPY[kind];

	return (
		<main className="shell flex min-h-[100dvh] flex-col justify-center gap-12 py-28 sm:gap-16">
			<section className="flex max-w-2xl flex-col gap-6">
				<h1 className="font-display text-[clamp(3.5rem,13vw,8.5rem)] text-text-primary">
					<span className="block">{copy.label}</span>
					<span className="block">not found</span>
				</h1>

				<p className="max-w-md text-base text-text-secondary">
					{copy.body}
				</p>

				<div className="flex flex-wrap gap-3 pt-2">
					<Link
						href={copy.ctaHref}
						className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-primary px-6 text-base font-medium text-[#0a0908] transition-all duration-200 ease-smooth hover:brightness-110 active:scale-[0.99]">
						{copy.ctaLabel}
						<FaArrowRight className="h-3.5 w-3.5" aria-hidden />
					</Link>

					<Link
						href="/"
						className="inline-flex h-12 items-center justify-center rounded-md border border-white/[0.15] px-6 text-base font-medium text-text-primary transition-colors duration-200 ease-smooth hover:border-primary/50 hover:text-accent">
						Back to home
					</Link>
				</div>
			</section>

			<RecoveryRail />
		</main>
	);
};

export default TitleNotFound;
