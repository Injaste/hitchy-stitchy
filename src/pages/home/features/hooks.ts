import { useRef, useState, useEffect, useCallback } from "react";
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

// ── useEmblaCarouselApi ────────────────────────────────────────────────────

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

// ── useEmblaEdgeDetection ─────────────────────────────────────────────────

export const useEmblaEdgeDetection = (emblaApi: EmblaCarouselType | undefined) => {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateEdges = useCallback((api: EmblaCarouselType) => {
    const progress = api.scrollProgress();
    const canScroll = api.containerNode().scrollWidth > api.rootNode().clientWidth;
    setShowLeftFade(canScroll && progress > 0.01);
    setShowRightFade(canScroll && progress < 0.99);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("scroll", updateEdges);
    emblaApi.on("settle", updateEdges);
    emblaApi.on("select", updateEdges);
    emblaApi.on("reInit", updateEdges);
    emblaApi.on("resize", updateEdges);

    updateEdges(emblaApi);

    return () => {
      emblaApi
        .off("scroll", updateEdges)
        .off("settle", updateEdges)
        .off("select", updateEdges)
        .off("reInit", updateEdges)
        .off("resize", updateEdges);
    };
  }, [emblaApi, updateEdges]);

  return { showLeftFade, showRightFade };
};
