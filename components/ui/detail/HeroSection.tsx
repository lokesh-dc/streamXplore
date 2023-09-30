import { getImageBaseLink } from "@/constants";
import Image from "next/image";
import React, { ReactElement, useEffect, useState } from "react";

import styles from "@/styles/LandingHero.module.css";
import { movieImages } from "@/constants/typescript";

interface props {
	backdrop_path: string;
	title: string;
	logos: Array<movieImages>;
}

const HeroSection: React.FC<props> = ({
	backdrop_path,
	title,
	logos,
}): ReactElement => {
	const [logoImage, setLogoImage] = useState("");
	useEffect(() => {
		for (let i = 0; i < logos.length; i++) {
			if (logos[i]?.iso_639_1 === "en") {
				setLogoImage(logos[i]?.file_path);
				break;
			}
		}
	}, [title]);

	return (
		<div className={`relative ${styles.landingSection}`}>
			<Image
				unoptimized
				priority
				className="w-screen h-full object-cover object-top brightness-75 md:brightness-100"
				src={getImageBaseLink({
					type: "backdrop",
					quality: "original",
					path: backdrop_path,
				})}
				height={500}
				width={1200}
				alt={`${title}`}
			/>
			<p
				className="absolute w-screen text-center text-7xl bebas_nueve pb-1 md:pb-10 hidden md:block"
				style={{
					bottom: 0,
					zIndex: "1",
					color: "white",
					background:
						"linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent)",
				}}
			>
				{title}
			</p>
			{/* <div
				className="absolute w-screen text-center text-7xl bebas_nueve pb-1 md:pb-10 hidden md:flex justify-center"
				style={{
					bottom: 0,
					zIndex: "1",
					color: "white",
					background:
						"linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent)",
				}}
			>
				<Image unoptimized
					alt={`${title}`}
					src={`${getImageBaseLink({
						type: "poster",
						quality: "original",
						path: logoImage,
					})}`}
					height={100}
					width={300}
				/>
			</div> */}
		</div>
	);
};

export default HeroSection;
