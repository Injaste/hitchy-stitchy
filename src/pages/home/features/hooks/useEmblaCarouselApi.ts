import { useRef, useState, useEffect, useCallback } from "react";
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

export const useEmblaCarouselApi = (
  align: "start" | "center" = "start",
  startIndex?: number,
) => {
  const viewportRef = useRef<HTMLElement | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | undefined>();

  const alignRef = useRef(align);
  const startIndexRef = useRef(startIndex);

  const emblaRef = useCallback((node: HTMLElement | null) => {
    viewportRef.current = node;
  }, []);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const api = EmblaCarousel(
      node,
      {
        containScroll: "keepSnaps",
        align: alignRef.current,
        startIndex: startIndexRef.current ?? 0,
        watchDrag: (a) => a.canScrollNext() || a.canScrollPrev(),
      },
      [WheelGesturesPlugin()],
    );
    setEmblaApi(api);

    return () => api.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { emblaRef, emblaApi };
};
