"use client";
import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";
import { motion } from "framer-motion";
import { scaleHover } from "@/lib/animations";
import { AiTwotoneStar } from "react-icons/ai";

import styles from "@/styles/MovieContainer.module.css";
import Link from "next/link";
import { decorateLink } from "@/utils";

type props = {
	imgSrc: string | null;
	title?: string;
	movieId: number | null;
	type?: string | null;
	showType: string;
	onClick?: (e: React.MouseEvent) => void;
	year?: string | number | null;
	rating?: number | null;
	mediaType?: string;
	overlay?: boolean;
};

const MovieCard: React.FC<props> = ({
	imgSrc,
	title,
	movieId,
	type,
	showType,
	onClick,
	year,
	rating,
	mediaType,
	overlay = false,
}): ReactElement => {
	const handleClick = (e: React.MouseEvent) => {
		if (onClick) {
			e.preventDefault();
			e.stopPropagation();
			onClick(e);
		}
	};

	const hasRating = rating != null && !Number.isNaN(Number(rating));
	const mediaLabel =
		mediaType === "tv" || showType === "tv" ? "Series" : mediaType ? "Film" : null;

	return (
		<Link
			href={`${showType}/${decorateLink(title)}/${movieId}`}
			onClick={handleClick}
			className="block">
			<motion.div
				variants={scaleHover}
				initial="initial"
				whileHover="hover"
				whileTap="tap"
				className={`${type == "scroll_card" ? styles?.scroll_card : styles.card} overflow-hidden will-change-transform`}>
				<div className={styles.cardImage}>
					<Image
						unoptimized
						width={500}
						height={750}
						src={getImageBaseLink({
							type: "poster",
							quality: "lg",
							path: imgSrc,
						})}
						alt={`${title ?? "Movie"} poster`}
						className={styles.cardImg}
					/>
				</div>

				{hasRating ? (
					<span className={styles.ratingChip}>
						<AiTwotoneStar />
						{Number(rating).toFixed(1)}
					</span>
				) : null}

				{overlay ? (
					<div className={styles.cardMeta}>
						<span className={styles.cardMetaTop}>
							{mediaLabel ? <span>{mediaLabel}</span> : null}
							{year ? <span>{year}</span> : null}
						</span>
						<h3 className={styles.cardTitle}>{title}</h3>
					</div>
				) : null}
			</motion.div>
		</Link>
	);
};

export default MovieCard;
