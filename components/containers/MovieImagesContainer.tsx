import { options } from "@/constants/api";
import React, { ReactElement, useEffect, useState } from "react";
import MovieImageCard from "@/components/cards/MovieImageCard";
import { movieImages } from "@/constants/typescript";
import Link from "next/link";
interface props {
	data: movieImages[];
	title: string;
	stateChange?: Function | null | undefined;
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
