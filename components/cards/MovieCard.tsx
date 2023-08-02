import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";

import styles from "@/styles/MovieContainer.module.css";
import Link from "next/link";
import { decorateLink } from "@/utils";

type props = {
	imgSrc: string;
	title?: string;
	movieId: number | null;
	type?: string | null;
};

const MovieCard: React.FC<props> = ({
	imgSrc,
	title,
	movieId,
	type,
}): ReactElement => {
	return (
		<Link href={`movie/${decorateLink(title)}/${movieId}`}>
			<div
				className={`${
					type == "scroll_card" ? styles?.scroll_card : styles.card
				} flex-col gap-1 ransform`}
			>
				<div className={`${styles.cardImage}`}>
					<Image
						width={500}
						height={200}
						src={getImageBaseLink({
							type: "poster",
							quality: "lg",
							path: imgSrc,
						})}
						alt={`${title}`}
					/>
				</div>
			</div>
		</Link>
	);
};

export default MovieCard;
