import Link from "next/link";
import Image from "next/image";

import { FiArrowRight } from "react-icons/fi";
import { GiSparkles } from "react-icons/gi";

import { getImageBaseLink } from "@/constants";

interface AiBannerProps {
	posters?: string[];
}

const AiBanner = ({ posters = [] }: AiBannerProps) => {
	const stack = posters.filter(Boolean).slice(0, 3);

	return (
		<section className="shell pt-4 pb-6">
			<div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0d0c] px-8 py-12 md:px-16 md:py-16">
				<div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
				<div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(90%_120%_at_100%_50%,rgba(230,80,27,0.10),transparent)] md:block" />

				<div className="relative grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
					<div className="flex max-w-xl flex-col gap-5">
						<span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ff8a5c]">
							<GiSparkles className="text-sm" />
							Hooked AI
						</span>

						<h2 className="font-display text-balance text-5xl leading-[0.95] text-text-primary md:text-6xl">
							Stop scrolling. Let AI choose.
						</h2>

						<p className="text-sm leading-relaxed text-text-secondary">
							Tell Hooked AI your mood or drop a few favorites. It returns a
							hand-picked shortlist of films and series — with a reason for
							every suggestion.
						</p>

						<div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
							<Link
								href="/recommendations"
								className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
								<GiSparkles className="text-base" />
								Get AI picks
								<FiArrowRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
							</Link>

							<span className="text-xs text-text-secondary">
								Free · takes about 20 seconds
							</span>
						</div>
					</div>

					{stack.length ? (
						<div className="relative mx-auto hidden aspect-square w-full max-w-[260px] items-center justify-center sm:flex">
							<div className="absolute h-[66%] w-[66%] rounded-full bg-primary/20 blur-3xl" />

							{stack.map((path, index) => {
								const isCenter = index === 0;
								const transform = isCenter
									? "translate(-50%, -50%) scale(1.06)"
									: index === 1
										? "translate(calc(-50% - 58px), calc(-50% + 16px)) rotate(-14deg)"
										: "translate(calc(-50% + 58px), calc(-50% + 16px)) rotate(14deg)";

								return (
									<div
										key={`${path}-${index}`}
										style={{ transform }}
										className={`absolute left-1/2 top-1/2 h-[60%] w-[42%] overflow-hidden rounded-[14px] border border-white/10 ${
											isCenter
												? "z-10 shadow-2xl shadow-black/60"
												: "opacity-40 grayscale"
										}`}>
										<Image
											unoptimized
											fill
											sizes="200px"
											src={getImageBaseLink({
												path,
												type: "poster",
												quality: "lg",
											})}
											alt=""
											className="object-cover"
										/>
									</div>
								);
							})}
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
};

export default AiBanner;
