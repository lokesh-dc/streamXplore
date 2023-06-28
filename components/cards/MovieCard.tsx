import { image_baseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";

import styles from "@/styles/MovieContainer.module.css";

type props = {
	imgSrc: string;
	title?: string;
};

const MovieCard: React.FC<props> = ({ imgSrc, title }): ReactElement => {
	return (
		<div className={`${styles.card} flex-col gap-1`}>
			<div className={`${styles.cardImage}`}>
				<Image
					width={500}
					height={200}
					src={`${image_baseLink}${imgSrc}`}
					alt={`${title}`}
				/>
			</div>
			<div className={`${styles.cardContent}`}>{title}</div>
		</div>
	);
};

export default MovieCard;
