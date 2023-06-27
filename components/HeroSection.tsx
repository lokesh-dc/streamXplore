import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { image_baseLink } from "@/constants";
import NavigationBar from "./layout/navigation";

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
				className="mySwiper"
			>
				{data?.map((item, index) => (
					<SwiperSlide key={index}>
						<div
							style={{
								backgroundImage: `url(${image_baseLink}${item.backdrop_path})`,
								height: "90vh",
								width: "100vw",
								backgroundSize: "cover",
							}}
							className="flex justify-center items-center"
						>
							<h1
								className="bebas_nueve uppercase"
								style={{
									color: "white",
									fontWeight: 400,
									fontSize: "100px",
									letterSpacing: "1px",
								}}
							>
								{item.title}
							</h1>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default HeroSection;
