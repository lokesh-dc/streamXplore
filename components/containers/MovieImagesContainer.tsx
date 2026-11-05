"use client";

import React, { ReactElement } from "react";
import MovieImageCard from "@/components/cards/MovieImageCard";
import { movieImages } from "@/constants/typescript";
import HorizontalSlider from "@/components/ui/HorizontalSlider";

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
		<div className="mt-8 mb-4">
			<h2 className="py-1 text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3 mb-6">
				<span className="w-1.5 h-6 bg-primary rounded-full"></span>
				Images
			</h2>
			<HorizontalSlider gap={16} itemClassName="pb-4" ariaLabel="Images">
				{data.map(({ file_path }, index) => (
					<MovieImageCard
						position={index}
						imgSrc={file_path}
						key={file_path ?? index}
						title={title}
						// @ts-ignore
						stateChange={stateChange}
					/>
				))}
			</HorizontalSlider>
		</div>
	);
};

export default MovieImages;
