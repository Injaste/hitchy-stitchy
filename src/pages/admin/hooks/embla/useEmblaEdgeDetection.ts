import { useState, useEffect, useCallback } from 'react'
import type { EmblaCarouselType } from 'embla-carousel'

export const useEmblaEdgeDetection = (emblaApi: EmblaCarouselType | undefined) => {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateEdges = useCallback((api: EmblaCarouselType) => {
    // Drive the fades off live scroll position rather than canScrollPrev/Next:
    // those are derived from the selected snap index, which only changes on
    // settle/select, so mid-drag they report stale values and the fade pops in
    // a frame late (a visible sharp edge). scrollProgress reads offsetLocation
    // directly, updating every scroll frame for an immediate, smooth fade.
    const progress = api.scrollProgress();
    // When nothing overflows, progress is 0 — gate on actual scrollability so we
    // don't show the end fade on a carousel that can't scroll.
    const canScroll = api.canScrollPrev() || api.canScrollNext();
    setShowLeftFade(canScroll && progress > 0.01);
    setShowRightFade(canScroll && progress < 0.99);
  }, [])

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
    }
  }, [emblaApi, updateEdges]);

  return { showLeftFade, showRightFade }
}
