import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { image_baseLink } from "@/constants";
import NavigationBar from "./layout/navigation";
import Image from "next/image";

import styles from "../styles/HeroSection.module.css";

import { AiTwotoneStar } from "react-icons/ai";

interface props {
	data: Array<movieDetails> | null;
}

interface movieDetails {
	adult: boolean | null;
	backdrop_path: string | null;
	genre_id: Array<number> | null;
	id: number | null;
	original_language: string | null;
	original_title: string | null;
	overview: string | null;
	popularity: number | null;
	poster_path: string | null;
	release_date: string | null;
	title: string | null;
	video: boolean | string | null;
	vote_average: number | null;
	vote_count: number | null;
}
const HeroSection = ({ data }: props) => {
	return (
		<div>
			<NavigationBar />
			<Swiper
				pagination={{
					dynamicBullets: true,
				}}
				autoplay={{
					delay: 3000,
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
									src={`${image_baseLink}${item.backdrop_path}`}
									alt={`${item.title}`}
									width={2000}
									height={500}
									priority
								/>
							</div>

							<div className={`${styles.contentContainer}`}>
								<p
									className={`${styles.rating} flex items-baseline justify-center`}
								>
									<AiTwotoneStar />
									<span>{item.vote_average}</span> / 10
								</p>
								<h3>{item.title}</h3>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default HeroSection;
