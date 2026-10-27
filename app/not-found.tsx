import Link from "next/link";
import type { ReactElement } from "react";
import { FaArrowRight } from "react-icons/fa";

import RecoveryRail from "@/components/ui/RecoveryRail";

export const metadata = {
	title: "Scene missing",
};

export default function NotFound(): ReactElement {
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

			<RecoveryRail />
		</main>
	);
}
