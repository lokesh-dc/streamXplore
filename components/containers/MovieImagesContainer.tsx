import React, { ReactElement } from "react";
import MovieImageCard from "@/components/cards/MovieImageCard";
import { movieImages } from "@/constants/typescript";
interface props {
	data: movieImages[];
	title: string;
	stateChange: Function;
}

const MovieImages: React.FC<props> = ({
	data,
	title,
	stateChange,
}): ReactElement => {
	return (
		<div className="p-1">
			<h2 className="py-1 text-2xl uppercase">Images</h2>
			<div
				className="flex gap-3 overflow-x-auto"
				style={{ width: "100%", overflowX: "scroll" }}
			>
				{data.map(({ file_path }, index) => (
					<MovieImageCard
						position={index}
						imgSrc={file_path}
						key={index}
						title={title}
						// @ts-ignore
						stateChange={stateChange}
					/>
				))}
			</div>
		</div>
	);
};

export default MovieImages;
