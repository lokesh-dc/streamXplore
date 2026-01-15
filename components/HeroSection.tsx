"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { getImageBaseLink } from "@/constants";
import Image from "next/image";

import styles from "../styles/HeroSection.module.css";

import { AiTwotoneStar } from "react-icons/ai";
import { IoIosPeople } from "react-icons/io";
import { movieDetails } from "@/constants/typescript";
import { Button } from "./buttons";

import { FaArrowRight } from "react-icons/fa";

interface props {
	data: Array<movieDetails> | null | undefined;
}

const HeroSection = ({ data }: props) => {
	if (!data) return;
	return (
		<div>
			<Swiper
				pagination={{
					dynamicBullets: true,
				}}
				autoplay={{
					delay: 10000,
					disableOnInteraction: true,
				}}
				navigation={true}
				modules={[Navigation, Pagination, Autoplay]}
				className="z-0"
			>
				{data?.map((item, index) => (
					<SwiperSlide key={index}>
						<div className={styles.slideContainer}>
							<div className={styles.imageContainer}>
								<Image
									unoptimized
									src={
										getImageBaseLink({
										type: "backdrop",
										quality: "xl",
										path: item.backdrop_path,
										})
									}
									alt={`${item.title}`}
									width={2000}
									height={500}
									priority={index === 0}
								/>
							</div>
							<div className={`${styles.contentContainer}`}>
								<div className="flex gap-3">
									{item.vote_average ? (
										<p
											className={`${styles.rating} flex items-baseline justify-center`}
										>
											<AiTwotoneStar />
											<span className="ml-1">
												{Math.floor(item.vote_average)}
											</span>
											/ 10
										</p>
									) : null}
									{item.vote_count ? (
										<p
											className={`${styles.rating} flex items-baseline justify-center`}
										>
											<IoIosPeople />
											<span className="ml-1">{item.vote_count}</span>
										</p>
									) : null}
								</div>
								{item?.genres?.map((gen) => (<div>{ gen?.name}</div>))}
								<h3>{item.title}</h3>
								<p className="w-1/2 line-clamp-3">{item?.overview}</p>
								<Button rightIcon={<FaArrowRight />}>More Info</Button>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default HeroSection;
