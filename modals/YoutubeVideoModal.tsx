"use client";

import React, { ReactElement } from "react";
import { motion } from "framer-motion";
import { modalVariants } from "@/lib/animations";
import YoutubeEmbedComponent from "@/components/functional-components/YoutubeEmbedComponent";
import { movieVideos } from "@/constants/typescript";

import { IoMdClose } from "react-icons/io";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import { useBodyLock } from "@/hooks/useBodyLock";

interface props {
	position: number;
	bodyType?: string;
	videoId: string;
	title: string;
	changeModalVideo: Function;
	data: Array<movieVideos>;
}

/**
 * Animated Youtube Video Modal.
 * Uses the centralized motion system for smooth entry/exit.
 */
const YoutubeVideoModal: React.FC<props> = ({
	position,
	videoId,
	title,
	changeModalVideo,
	data,
}): ReactElement => {
	// Lock body scroll
	useBodyLock(true);

	const handleModalImageChange = (event: any, incre: number) => {
		event.stopPropagation();
		if (position + incre < data.length && position + incre >= 0)
			changeModalVideo(
				position + incre,
				data[position + incre]?.key,
				data[position + incre]?.name
			);
	};

	return (
		<motion.div
			variants={modalVariants.backdrop}
			initial="initial"
			animate="animate"
			exit="exit"
			className="fixed top-0 left-0 w-screen h-screen bg-black/60 flex flex-col justify-center items-center gap-2 z-[2055] default_screen_adjust backdrop-blur-xl"
			onClick={() => changeModalVideo(0, "", "")}
		>
			<motion.div
				variants={modalVariants.content}
				className="flex flex-col items-center w-full max-w-4xl px-4"
				onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
			>
				<div
					className="text-white flex w-full justify-end mb-2 cursor-pointer hover:scale-110 transition-transform"
					onClick={() => changeModalVideo(0, "", "")}
				>
					<IoMdClose style={{ fontSize: "30px" }} />
				</div>
				
				<div className="youtubeModal w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
					<YoutubeEmbedComponent
						classes={"w-full h-full"}
						videoId={videoId}
						title={title}
					/>
				</div>

				<div className="w-72 flex justify-between mt-6 text-white/80">
					<div
						className="p-3 flex items-center cursor-pointer hover:text-white transition-colors"
						onClick={(event) => handleModalImageChange(event, -1)}
						style={{
							opacity: position === 0 ? 0.3 : 1,
							pointerEvents: position === 0 ? "none" : "auto",
						}}
					>
						<RiArrowLeftSLine />
						<span className="ml-1">previous</span>
					</div>
					
					<p className="p-3 opacity-40 font-mono">
						{position + 1} / {data?.length}
					</p>

					<div
						className="p-3 flex items-center cursor-pointer hover:text-white transition-colors"
						onClick={(event) => handleModalImageChange(event, 1)}
						style={{
							opacity: position === data?.length - 1 ? 0.3 : 1,
							pointerEvents: position === data?.length - 1 ? "none" : "auto",
						}}
					>
						<span className="mr-1">next</span>
						<RiArrowRightSLine style={{ fontSize: "18px" }} />
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default YoutubeVideoModal;
