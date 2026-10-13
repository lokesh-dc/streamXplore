"use client";

import React, { ReactElement, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { modalVariants } from "@/lib/animations";
import Image from "next/image";
import YoutubeEmbedComponent from "@/components/functional-components/YoutubeEmbedComponent";
import { movieVideos } from "@/constants/typescript";

import { IoMdClose } from "react-icons/io";
import {
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiPlayMiniLine,
} from "react-icons/ri";
import { useBodyLock } from "@/hooks/useBodyLock";

interface props {
	position: number;
	bodyType?: string;
	videoId: string;
	title: string;
	changeModalVideo: Function;
	data: Array<movieVideos>;
}

const YoutubeVideoModal: React.FC<props> = ({
	position,
	videoId,
	title,
	changeModalVideo,
	data,
}): ReactElement => {
	// Lock body scroll
	useBodyLock(true);

	const stripRef = useRef<HTMLDivElement>(null);

	const canPrev = position > 0;
	const canNext = position < data.length - 1;

	const close = () => changeModalVideo(0, "", "");

	const go = (incre: number) => {
		if (position + incre < data.length && position + incre >= 0) {
			changeModalVideo(
				position + incre,
				data[position + incre]?.key,
				data[position + incre]?.name,
			);
		}
	};

	// Keyboard: Esc closes, arrow keys switch videos
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				close();
			} else if (event.key === "ArrowLeft") {
				go(-1);
			} else if (event.key === "ArrowRight") {
				go(1);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	// Keep the active thumbnail centered in the desktop filmstrip
	useEffect(() => {
		const active = stripRef.current?.querySelector<HTMLElement>(
			"[data-active='true']",
		);
		active?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "center",
		});
	}, [position, videoId]);

	return (
		<motion.div
			variants={modalVariants.backdrop}
			initial="initial"
			animate="animate"
			exit="exit"
			onClick={close}
			className="fixed inset-0 z-[2055] flex flex-col items-stretch justify-start overflow-hidden bg-[#070605]/95 p-0 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-center sm:overflow-y-auto sm:p-6">
			{/* Ambient glow behind the stage */}
			<span
				aria-hidden
				className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[120px] sm:block"
			/>

			<motion.div
				variants={modalVariants.content}
				className="relative z-10 flex h-[100dvh] w-full flex-col pt-[env(safe-area-inset-top)] sm:h-auto sm:max-w-6xl sm:gap-4 sm:pt-0 lg:max-w-[min(72rem,calc((100vh_-_18rem)*16/9))]"
				onClick={(e: any) => e.stopPropagation()}>
				{/* Desktop top bar */}
				<div className="hidden items-center justify-between gap-4 sm:flex">
					<div className="flex min-w-0 flex-col gap-1">
						<span className="eyebrow">
							{data[position]?.type || "Video"}
						</span>
						<p className="truncate text-base font-semibold text-text-primary sm:text-lg">
							{title}
						</p>
					</div>
					<button
						type="button"
						onClick={close}
						aria-label="Close player"
						className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-text-primary transition-all duration-200 hover:scale-105 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
						<IoMdClose className="text-xl" />
					</button>
				</div>

				{/* Stage */}
				<div className="group/stage relative shrink-0">
					{/* Mobile close (overlaid on the video) */}
					<button
						type="button"
						onClick={close}
						aria-label="Close player"
						className="absolute right-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md sm:hidden">
						<IoMdClose className="text-xl" />
					</button>

					<button
						type="button"
						aria-label="Previous video"
						disabled={!canPrev}
						onClick={() => go(-1)}
						className="absolute -left-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/80 sm:flex disabled:pointer-events-none disabled:opacity-25"
					>
						<RiArrowLeftSLine className="text-2xl" />
					</button>

					<div className="modal-player relative aspect-video w-full overflow-hidden bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] sm:rounded-2xl sm:border sm:border-white/10">
						<YoutubeEmbedComponent
							classes={"h-full w-full"}
							videoId={videoId}
							title={title}
						/>
					</div>

					<button
						type="button"
						aria-label="Next video"
						disabled={!canNext}
						onClick={() => go(1)}
						className="absolute -right-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/80 sm:flex disabled:pointer-events-none disabled:opacity-25"
					>
						<RiArrowRightSLine className="text-2xl" />
					</button>
				</div>

				{/* Mobile meta row */}
				<div className="flex items-start justify-between gap-3 px-4 py-3 sm:hidden">
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="eyebrow">
							{data[position]?.type || "Video"}
						</span>
						<p className="line-clamp-2 text-sm font-semibold text-text-primary">
							{title}
						</p>
					</div>
					<span className="shrink-0 pt-1 font-mono text-xs tabular text-text-secondary">
						{position + 1} / {data.length}
					</span>
				</div>

				{/* Desktop filmstrip */}
				<div
					ref={stripRef}
					className="hidden gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex">
					{data.map((video, index) => {
						const active = index === position;
						return (
							<button
								key={video.id ?? index}
								type="button"
								data-active={active}
								onClick={() =>
									changeModalVideo(index, video.key, video.name)
								}
								aria-label={`Play ${video.name}`}
								aria-current={active}
								className={`group relative aspect-video w-32 shrink-0 overflow-hidden rounded-md border transition-colors ${
									active
										? "border-primary"
										: "border-white/10 hover:border-white/30"
								}`}>
								<Image
									unoptimized
									src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
									alt={video.name}
									fill
									sizes="128px"
									className="object-cover"
								/>
								<span
									className={`absolute inset-0 flex items-center justify-center transition-colors ${
										active
											? "bg-primary/20"
											: "bg-black/35 group-hover:bg-black/10"
									}`}>
									<RiPlayMiniLine
										className={`text-lg ${
											active ? "text-primary" : "text-white"
										}`}
									/>
								</span>
								<span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
							</button>
						);
					})}
				</div>

				{/* Mobile: scrollable list of other videos */}
				<div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-8 sm:hidden">
					<p className="eyebrow px-1 pb-3 pt-1">More videos</p>
					<ul className="flex flex-col gap-2">
						{data.map((video, index) => {
							const active = index === position;
							return (
								<li key={video.id ?? index}>
									<button
										type="button"
										onClick={() =>
											changeModalVideo(index, video.key, video.name)
										}
										aria-current={active}
										className={`flex w-full items-start gap-3 rounded-lg border p-2 text-left transition-colors ${
											active
												? "border-primary/60 bg-primary/10"
												: "border-white/5 bg-white/[0.03] active:bg-white/[0.07]"
										}`}>
										<span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-black">
											<Image
												unoptimized
												src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
												alt={video.name}
												fill
												sizes="128px"
												className="object-cover"
											/>
											{active ? (
												<span className="absolute inset-0 flex items-center justify-center bg-primary/25">
													<RiPlayMiniLine className="text-lg text-primary" />
												</span>
											) : null}
										</span>
										<span className="min-w-0 flex-1 py-0.5">
											<span className="block truncate text-[10px] font-semibold uppercase tracking-widest text-primary">
												{video.type}
											</span>
											<span className="mt-0.5 line-clamp-2 text-xs font-medium leading-snug text-text-primary">
												{video.name}
											</span>
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</div>

				{/* Desktop footer */}
				<div className="hidden items-center justify-between text-xs text-white/40 sm:flex">
					<span className="inline-flex items-center gap-1.5">
						<kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans normal-case tracking-normal text-text-secondary">
							Esc
						</kbd>
						<span>to close</span>
						<kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans normal-case tracking-normal text-text-secondary">
							←
						</kbd>
						<kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans normal-case tracking-normal text-text-secondary">
							→
						</kbd>
						<span>to switch</span>
					</span>
					<span className="tabular text-text-secondary">
						{position + 1} / {data.length}
					</span>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default YoutubeVideoModal;