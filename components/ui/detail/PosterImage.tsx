import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";

interface props {
	poster_path: string;
}

const PosterImage: React.FC<props> = ({ poster_path }): ReactElement => {
	return (
		<div
			className="flex md:hidden justify-center relative"
			style={{ minHeight: "220px" }}
		>
			<Image
				className="absolute"
				style={{ top: "-120px" }}
				src={getImageBaseLink({
					type: "poster",
					quality: "xl",
					path: poster_path,
				})}
				width={220}
				height={300}
				alt="poster"
			/>
		</div>
	);
};

export default PosterImage;
