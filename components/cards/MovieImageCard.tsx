import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";

interface props {
	imgSrc: string;
	imgType?: string;
	title: string;
}

const MovieCardImage: React.FC<props> = ({ imgSrc, title }): ReactElement => {
	return (
		<div className="movie_image_card">
			<Image
				src={getImageBaseLink({
					path: imgSrc,
					type: "backdrop",
					quality: "lg",
				})}
				width={500}
				height={300}
				alt={`${title} image`}
			/>
		</div>
	);
};

export default MovieCardImage;
