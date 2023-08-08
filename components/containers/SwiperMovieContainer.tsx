import { movieDetails } from "@/constants/typescript";
import React, { ReactElement } from "react";

import styles from "@/styles/MovieContainer.module.css";

import dynamic from "next/dynamic";
const MovieCard = dynamic(() => import("../cards/MovieCard"));
// import MovieCard from "../cards/MovieCard";

interface props {
	data: Array<movieDetails> | null | undefined;
	title?: string;
	showType: string;
}

const MovieContainer: React.FC<props> = ({
	data,
	title,
	showType,
}): ReactElement => {
	return (
		<div className="p-3 py-5 flex flex-col gap-1">
			{title ? (
				<h2 className={`text-4xl bebas_nueve ${styles.title}`}>{title}</h2>
			) : null}
			<div className={`flex gap-3 overflow-x-auto ${styles.container}`}>
				{data?.map((item, index) => (
					<MovieCard
						key={index}
						// @ts-ignore
						imgSrc={`${item.poster_path || item.file_path}`}
						title={`${item?.title || item?.name}`}
						movieId={item.id}
						type={"scroll_card"}
						showType={showType}
					/>
				))}
			</div>
		</div>
	);
};

export default MovieContainer;
