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
					delay: 7000,
					disableOnInteraction: false,
				}}
				navigation={true}
				modules={[Navigation, Pagination, Autoplay]}
				className="mySwiper z-0"
			>
				{data?.map((item, index) => (
					<SwiperSlide key={index}>
						<div className={styles.slideContainer}>
							<div className={styles.imageContainer}>
								<Image
									src={getImageBaseLink({
										type: "backdrop",
										quality: "xl",
										path: item.backdrop_path,
									})}
									alt={`${item.title}`}
									width={2000}
									height={500}
									priority={index === 0}
								/>
							</div>
							<div className={`${styles.contentContainer}`}>
								<div className="flex gap-3 justify-center">
									<p
										className={`${styles.rating} flex items-baseline  justify-center`}
									>
										<AiTwotoneStar />
										<span className="ml-1">
											{item.vote_average ? Math.floor(item.vote_average) : 0}
										</span>
										{"  "}/ 10
									</p>
									<p
										className={`${styles.rating} flex items-baseline justify-center`}
									>
										<IoIosPeople />
										<span className="ml-1">{item.vote_count}</span>
									</p>
								</div>
								<h3>{item.title}</h3>
							</div>
							<div className={`${styles.movieCard} hidden md:flex`}>
								<div>
									<Image
										width={300}
										height={200}
										src={getImageBaseLink({
											type: "poster",
											quality: "lg",
											path: item.poster_path,
										})}
										alt={`${item.title}`}
										priority={index === 0}
									/>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default HeroSection;
