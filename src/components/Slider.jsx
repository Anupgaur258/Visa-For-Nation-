import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
export default function Slider({ items, render, breakpoints, autoplay = 3000, gap = 20, loop = false }) {
  return (
    <Swiper modules={[Navigation, Autoplay]} navigation spaceBetween={gap} breakpoints={breakpoints} loop={loop}
      autoplay={autoplay ? { delay: autoplay, disableOnInteraction: false, pauseOnMouseEnter: true } : false} className="slider">
      {items.map((it, i) => <SwiperSlide key={i}>{render(it, i)}</SwiperSlide>)}
    </Swiper>
  );
}
