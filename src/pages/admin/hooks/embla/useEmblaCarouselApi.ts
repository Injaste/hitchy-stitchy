import { type EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

export const useEmblaCarouselApi = ({ }: EmblaOptionsType) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "keepSnaps",
    align: "start",
    watchDrag: (api) => api.canScrollNext() || api.canScrollPrev(),
  });

  return { emblaRef, emblaApi }
}
