import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { Pagination } from "swiper";

const SwiperCurousel = () => {
	return (
		<>
			<Swiper
				pagination={{
					dynamicBullets: true,
				}}
				modules={[Pagination]}
				className="mySwiper"
			>
				<SwiperSlide>Slide 1</SwiperSlide>
				<SwiperSlide>Slide 1</SwiperSlide>
				<SwiperSlide>Slide 1</SwiperSlide>
				<SwiperSlide>Slide 1</SwiperSlide>
				<SwiperSlide>Slide 1</SwiperSlide>
				<SwiperSlide>Slide 1</SwiperSlide>
			</Swiper>
		</>
	);
};

export default SwiperCurousel;
