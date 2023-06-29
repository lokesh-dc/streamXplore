import { movieDetails } from "@/constants/typescript";
import React, { ReactElement } from "react";

import styles from "@/styles/MovieContainer.module.css";
import MovieCard from "../cards/MovieCard";

interface props {
	data: Array<movieDetails> | null;
	title?: string;
}

const MovieContainer: React.FC<props> = ({ data, title }): ReactElement => {
	return (
		<div className="p-3 py-5 flex flex-col gap-1">
			{title ? <h2 className="text-4xl bebas_nueve">{title}</h2> : null}
			<div className={`flex gap-2 overflow-x-auto ${styles.container}`}>
				{data?.map((item, index) => (
					<MovieCard
						key={index}
						imgSrc={`${item.poster_path}`}
						title={`${item.title}`}
					/>
				))}
			</div>
		</div>
	);
};

export default MovieContainer;
