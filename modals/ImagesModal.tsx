"use client";
import { getImageBaseLink } from "@/constants";
import { movieImages } from "@/constants/typescript";
import Image from "next/image";
import React, { ReactElement } from "react";

import { IoMdClose } from "react-icons/io";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import { useBodyLock } from "@/hooks/useBodyLock";

interface props {
	position: number;
	bodyType?: string;
	mediaSource?: string | string[] | undefined;
	changeModalImage: Function;
	data: Array<movieImages>;
}

const Modal: React.FC<props> = ({
	position,
	mediaSource,
	changeModalImage,
	data,
}): ReactElement => {
	// Lock body scroll
	useBodyLock(true);

	const handleModalImageChange = (event: any, incre: number) => {
		event.stopPropagation();
		if (position + incre < data.length && position + incre >= 0)
			changeModalImage(position + incre, data[position + incre]?.file_path);
	};

	return (
		<div
			className="fixed inset-0 z-[2055] bg-black/60 flex flex-col justify-center items-center p-4 backdrop-blur-xl"
			onClick={(event) => {
				event.stopPropagation();
				changeModalImage("");
			}}
		>
			<div
				className="w-full max-w-5xl text-white flex cursor-pointer justify-end mb-4"
				onClick={() => changeModalImage("")}
			>
				<div className="p-2 hover:bg-white/10 rounded-full transition-colors">
					<IoMdClose style={{ fontSize: "30px" }} />
				</div>
			</div>
			
			<div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
				<Image
					unoptimized
					fill
					src={getImageBaseLink({
						path: mediaSource,
						type: "backdrop",
						quality: "lg",
					})}
					className="object-contain bg-black"
					alt={`image`}
				/>
			</div>

			<div className="flex items-center gap-8 mt-8 text-white">
				<button
					className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					onClick={(event) => handleModalImageChange(event, -1)}
					disabled={position === 0}
				>
					<RiArrowLeftSLine className="text-xl" />
					<span className="font-medium">Previous</span>
				</button>

				<p className="font-mono text-white/50 bg-white/5 px-4 py-1 rounded-full text-sm">
					{position + 1} / {data?.length}
				</p>

				<button
					className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
					disabled={position === data?.length - 1}
					onClick={(event) => handleModalImageChange(event, 1)}
				>
					<span className="font-medium">Next</span>
					<RiArrowRightSLine className="text-xl" />
				</button>
			</div>
		</div>
	);
};
export default Modal;
