"use client";
import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement } from "react";
import { motion } from "framer-motion";
import { scaleHover } from "@/lib/animations";

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
};

const MovieCard: React.FC<props> = ({
	imgSrc,
	title,
	movieId,
	type,
	showType,
	onClick,
}): ReactElement => {
	const handleClick = (e: React.MouseEvent) => {
		if (onClick) {
			e.preventDefault();
			e.stopPropagation();
			onClick(e);
		}
	};

	return (
		<Link
			href={`${showType}/${decorateLink(title)}/${movieId}`}
			onClick={handleClick}
		>
			<motion.div
				variants={scaleHover}
				initial="initial"
				whileHover="hover"
				whileTap="tap"
				className={`${
					type == "scroll_card" ? styles?.scroll_card : styles.card
				} flex-col gap-1 overflow-hidden rounded-xl will-change-transform`}
			>
				<div className={`${styles.cardImage}`}>
					<Image
						unoptimized
						width={500}
						height={200}
						src={getImageBaseLink({
							type: "poster",
							quality: "lg",
							path: imgSrc,
						})}
						alt={`${title}`}
						className="transition-opacity duration-300"
					/>
				</div>
			</motion.div>
		</Link>
	);
};

export default MovieCard;
