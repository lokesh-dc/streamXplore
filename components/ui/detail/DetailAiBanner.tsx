"use client";

import Image from "next/image";
import Link from "next/link";

import { FiArrowRight, FiMessageSquare } from "react-icons/fi";
import { GiSparkles } from "react-icons/gi";

import { getImageBaseLink } from "@/constants";

interface DetailAiBannerProps {
	id: number;
	mediaType: "movie" | "tv";
	title: string;
	posterPath?: string | null;
}

const DetailAiBanner = ({
	id,
	mediaType,
	title,
	posterPath,
}: DetailAiBannerProps) => {
	const seedHref = `/recommendations?seed=${id}&type=${mediaType}&title=${encodeURIComponent(
		title,
	)}`;

	const askInChat = () => {
		const kind = mediaType === "tv" ? "shows" : "movies";
		window.dispatchEvent(
			new CustomEvent("hooked:chat", {
				detail: {
					text: `I just finished ${title}. Recommend a few ${kind} like it and give me a one-line reason for each.`,
				},
			}),
		);
	};

	return (
		<section className="shell pb-24 pt-2">
			<div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0d0c] px-8 py-12 md:px-16 md:py-14">
				<div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
				<div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(90%_120%_at_100%_50%,rgba(230,80,27,0.12),transparent)] md:block" />

				<div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
					<div className="flex max-w-xl flex-col gap-5">
						<span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ff8a5c]">
							<GiSparkles className="text-sm" />
							Hooked AI
						</span>

						<h2 className="font-display text-balance text-4xl leading-[0.95] text-text-primary md:text-5xl">
							Finished {title}? Let AI line up your next watch.
						</h2>

						<p className="text-sm leading-relaxed text-text-secondary">
							Hooked AI reads what you just watched and hand-picks a shortlist
							of films and series — with a reason for every suggestion.
						</p>

						<div className="mt-1 flex flex-wrap items-center gap-3">
							<Link
								href={seedHref}
								className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
								<GiSparkles className="text-base" />
								Get AI picks like this
								<FiArrowRight className="transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
							</Link>

							<button
								type="button"
								onClick={askInChat}
								className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
								<FiMessageSquare className="text-base" />
								Ask Hooked AI
							</button>
						</div>
					</div>

					<div className="relative mx-auto hidden h-44 w-32 items-center justify-center md:flex">
						<div className="absolute h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
						<div className="relative h-44 w-[118px] rotate-[7deg] overflow-hidden rounded-[14px] border border-white/10 shadow-2xl shadow-black/60">
							{posterPath ? (
								<Image
									unoptimized
									fill
									sizes="118px"
									src={getImageBaseLink({
										type: "poster",
										quality: "md",
										path: posterPath,
									})}
									alt={title}
									className="object-cover"
								/>
							) : null}
						</div>
						<GiSparkles className="absolute -right-3 -top-2 text-xl text-primary" />
						<GiSparkles className="absolute -bottom-1 -left-3 text-sm text-primary/70" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default DetailAiBanner;
