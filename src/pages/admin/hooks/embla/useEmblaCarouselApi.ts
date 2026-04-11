import useEmblaCarousel from "embla-carousel-react";

export const useEmblaCarouselApi = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "keepSnaps",
    align: "start",
    watchDrag: (api) => api.canScrollNext() || api.canScrollPrev(),
  });

  return { emblaRef, emblaApi }
}
