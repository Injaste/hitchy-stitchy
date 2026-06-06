import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

/**
 * @param align - snap alignment. "center" keeps the active slide clear of both
 *   edge fades (its leading/trailing edges land where the fades turn transparent)
 *   when the slide is sized to fit between them; Embla still clamps the first and
 *   last snaps flush to the edges. "start" is the plain left-aligned behaviour.
 */
export const useEmblaCarouselApi = (align: "start" | "center" = "start") => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      containScroll: "keepSnaps",
      align,
      watchDrag: (api) => api.canScrollNext() || api.canScrollPrev(),
    },
    [WheelGesturesPlugin()],
  );

  return { emblaRef, emblaApi };
};
