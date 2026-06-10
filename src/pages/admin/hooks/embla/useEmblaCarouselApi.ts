import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

/**
 * @param align - snap alignment. "center" keeps the active slide clear of both
 *   edge fades (its leading/trailing edges land where the fades turn transparent)
 *   when the slide is sized to fit between them; Embla still clamps the first and
 *   last snaps flush to the edges. "start" is the plain left-aligned behaviour.
 */
export const useEmblaCarouselApi = (
  align: "start" | "center" = "start",
  startIndex?: number,
) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      containScroll: "keepSnaps",
      align,
      startIndex,
      watchDrag: (api) => api.canScrollNext() || api.canScrollPrev(),
    },
    [WheelGesturesPlugin()],
  );

  // embla-carousel-react v8 uses useState's setter as the ref callback.
  // React 18 batches setViewport(null)+setViewport(el) from Strict Mode's
  // double-invoke into a net no-op, so the init effect never re-fires and
  // Embla is left in a destroyed state. scrollProgress() === null is the
  // reliable signal — at position 0 it returns 0, never null unless destroyed.
  useEffect(() => {
    if (emblaApi && emblaApi.scrollProgress() === null) emblaApi.reInit();
  }, [emblaApi]);

  return { emblaRef, emblaApi };
};
