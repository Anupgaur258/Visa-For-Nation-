import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

export default function Slider({ items, render, breakpoints, autoplay = 3000, gap = 20, loop = false }) {
  const [swiper, setSwiper] = useState(null);
  const [edges, setEdges] = useState({ beginning: true, end: false });
  const updateEdges = instance => setEdges({ beginning: instance.isBeginning, end: instance.isEnd });
  return (
    <div className="hm-slider-wrap">
      <Swiper modules={[Autoplay]} onSwiper={instance => { setSwiper(instance); updateEdges(instance); }}
        onSlideChange={updateEdges} spaceBetween={gap} breakpoints={breakpoints} loop={loop}
        autoplay={autoplay ? { delay: autoplay, disableOnInteraction: false, pauseOnMouseEnter: true } : false} className="slider">
        {items.map((it, i) => <SwiperSlide key={i}>{render(it, i)}</SwiperSlide>)}
      </Swiper>
      <div className="hm-carousel-arrows" aria-label="Carousel navigation">
        <button type="button" aria-label="Previous" disabled={!loop && edges.beginning} onClick={() => swiper?.slidePrev()}>&#8592;</button>
        <button type="button" aria-label="Next" disabled={!loop && edges.end} onClick={() => swiper?.slideNext()}>&#8594;</button>
      </div>
    </div>
  );
}
