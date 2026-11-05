import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";

interface props {
	position: number | undefined | null;
	imgSrc: string | null;
	imgType?: string;
	title: string | null;
	stateChange: Function;
}

const MovieCardImage: React.FC<props> = ({
	position,
	imgSrc,
	title,
	stateChange,
}): ReactElement => {
	return (
		// @ts-ignore
		<div
			className="movie_image_card cursor-pointer select-none overflow-hidden rounded-lg"
			onClick={() => stateChange(position, imgSrc)}
		>
			<Image
				unoptimized
				loading="lazy"
				decoding="async"
				draggable={false}
				src={getImageBaseLink({
					path: imgSrc,
					type: "backdrop",
					quality: "lg",
				})}
				width={250}
				height={150}
				alt={`${title} image`}
			/>
		</div>
	);
};

export default MovieCardImage;
