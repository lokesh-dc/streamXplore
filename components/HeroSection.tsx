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
import Tags from "./tags";
import { useRouter } from "next/navigation";
import { decorateLink } from "@/utils";

interface props {
	data: Array<movieDetails> | null | undefined;
}

const HeroSection = ({ data }: props) => {
	const router = useRouter();
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
				className="z-0">
				{data?.map((item, index) => {
					const title = item.title || item.name;
					const mediaType = item.media_type || (item.title ? "movie" : "tv");

					return (
						<SwiperSlide key={index}>
							<div className={styles.slideContainer}>
								<div className={styles.imageContainer}>
									<Image
										unoptimized
										src={getImageBaseLink({
											type: "backdrop",
											quality: "xl",
											path: item.backdrop_path,
										})}
										alt={`${title}`}
										width={2000}
										height={500}
										priority={index === 0}
									/>
								</div>
								<div className={`${styles.contentContainer}`}>
									<div className="flex gap-3">
										{item.vote_average ? (
											<p
												className={`${styles.rating} flex items-baseline justify-center`}>
												<AiTwotoneStar />
												<span className="ml-1">
													{Math.floor(item.vote_average)}
												</span>
												/ 10
											</p>
										) : null}
										{item.vote_count ? (
											<p
												className={`${styles.rating} flex items-baseline justify-center`}>
												<IoIosPeople />
												<span className="ml-1">{item.vote_count}</span>
											</p>
										) : null}
									</div>
									<div className="flex flex-col gap-2">
										<Tags variant="glassy" data={item?.genres} />
										<h3 className="text-3xl">{title}</h3>
									</div>
									<p className="w-full md:w-1/2 line-clamp-3 text-gray-300">
										{item?.overview}
									</p>
									<Button
										rightIcon={<FaArrowRight />}
										onClick={() =>
											router.push(`/${mediaType}/${decorateLink(title)}/${item.id}`)
										}>
										More Info
									</Button>
								</div>
							</div>
						</SwiperSlide>
					);
				})}
			</Swiper>
		</div>
	);
};

export default HeroSection;
