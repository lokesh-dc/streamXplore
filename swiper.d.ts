declare module 'swiper' {
    import { SwiperModule } from 'swiper/types/shared';
    import Swiper from 'swiper/types/swiper-class';
    
    export * from 'swiper/types';
    
    export const Autoplay: SwiperModule;
    export const Navigation: SwiperModule;
    export const Pagination: SwiperModule;

    export default Swiper;
}

declare module 'swiper/react' {
    export * from 'swiper/react/swiper-react';
}
