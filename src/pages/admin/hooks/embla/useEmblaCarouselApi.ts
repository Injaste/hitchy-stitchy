import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

export const useEmblaCarouselApi = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      containScroll: "keepSnaps",
      align: "start",
      watchDrag: (api) => api.canScrollNext() || api.canScrollPrev(),
    },
    [WheelGesturesPlugin()],
  );

  return { emblaRef, emblaApi };
};
