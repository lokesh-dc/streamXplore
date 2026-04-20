"use client";

import { movieVideos } from "@/constants/typescript";
import YoutubeVideoModal from "@/modals/YoutubeVideoModal";
import React, { ReactElement, useEffect, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useBodyLock } from "@/hooks/useBodyLock";
import { FaPlay } from "react-icons/fa";

interface props {
	data: Array<movieVideos>;
	movieId: string;
}

const VideosContainer: React.FC<props> = ({ data, movieId }): ReactElement => {
	const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	useEffect(() => {
		videoSorter(data);
	}, [movieId]);

	function videoSorter(data: Array<movieVideos>) {
		let types: any = {};
		for (let i = 0; i < data.length; i++) {
			if (
				types[data[i]?.type] == undefined &&
				(data[i]?.type == "Trailer" || data[i]?.type == "Teaser")
			) {
				types[data[i]?.type] = [data[i]];
			} else if (
				(data[i]?.type == "Trailer" || data[i]?.type == "Teaser") &&
				types[data[i]?.type]?.length < 5
			) {
				types[data[i]?.type].push(data[i]);
			}
		}
		setMovieVideos(types);
	}

	const [movieVideos, setMovieVideos] = useState({});
	const [modalVideo, setVideoModal] = useState({
		position: 0,
		key: "",
		title: "",
	});

	// Use manual event listeners for better desktop wheel support
	useEffect(() => {
		const refs = scrollRefs.current;
		const handlers: { [key: string]: (e: WheelEvent) => void } = {};

		Object.keys(movieVideos).forEach((type) => {
			const el = refs[type];
			if (el) {
				handlers[type] = (e: WheelEvent) => {
					if (e.deltaY === 0) return;
					const isScrollingLeft = e.deltaY < 0;
					const canScrollLeft = el.scrollLeft > 0;
					const canScrollRight =
						el.scrollLeft < el.scrollWidth - el.clientWidth;

					if (
						(isScrollingLeft && canScrollLeft) ||
						(!isScrollingLeft && canScrollRight)
					) {
						e.preventDefault();
						el.scrollLeft += e.deltaY;
					}
				};
				el.addEventListener("wheel", handlers[type], { passive: false });
			}
		});

		return () => {
			Object.keys(handlers).forEach((type) => {
				refs[type]?.removeEventListener("wheel", handlers[type]);
			});
		};
	}, [movieVideos]);

	const changeModalVideo = (position: number, key: string, title: string) => {
		setVideoModal({ position, key: key, title: title });
	};

	// Lock body scroll only when modal is active
	useBodyLock(!!modalVideo?.key);

	return Object.keys(movieVideos)?.length ? (
		<>
			<h2 className="py-1 text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3 mb-4 mt-8">
				<span className="w-1.5 h-6 bg-primary rounded-full"></span>
				Videos
			</h2>
			<div className="flex flex-col gap-4">
				{Object.keys(movieVideos)?.map((item, index) => (
					<div className="flex flex-col gap-2" key={index}>
						<h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
							{item}s
						</h3>
						<div
							ref={(el) => (scrollRefs.current[item] = el)}
							className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 overscroll-x-contain no-scrollbar scrollbar-hide">
							{(movieVideos as any)[item]?.map(
								({ name, type, key }: any, playlistIndex: number) => (
									<div
										className="group relative flex-none w-[240px] aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-zinc-900 shadow-lg"
										key={playlistIndex}
										onClick={() => changeModalVideo(playlistIndex, key, name)}>
										<img
											src={`https://img.youtube.com/vi/${key}/mqdefault.jpg`}
											alt={name}
											className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-all duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
											<h4 className="text-xs font-bold text-white truncate">
												{name}
											</h4>
										</div>
										<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
											<div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
												<FaPlay className="text-white text-xs ml-0.5" />
											</div>
										</div>
									</div>
								),
							)}
						</div>
					</div>
				))}
			</div>

			<AnimatePresence>
				{modalVideo?.key && (
					<YoutubeVideoModal
						videoId={modalVideo?.key}
						title={modalVideo?.title}
						position={modalVideo?.position}
						changeModalVideo={changeModalVideo}
						data={data}
					/>
				)}
			</AnimatePresence>
		</>
	) : (
		(null as any)
	);
};

export default VideosContainer;
