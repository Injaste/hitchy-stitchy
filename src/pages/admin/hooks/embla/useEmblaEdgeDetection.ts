import { useState, useEffect, useCallback } from 'react'
import type { EmblaCarouselType } from 'embla-carousel'

/**
 * DELIBERATE DUPLICATE of `pages/home/features/hooks.ts`. Home and admin are
 * bundled as independent sites, and a shared module would land in `shared`,
 * which loads on every route — including the wedding invite, which has no
 * carousels at all. See `docs/architecture/bundling.md`. Do not "dedupe" these
 * into a common hook; fix both copies instead.
 */
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
    // Gate on real DOM overflow rather than Embla's snap-based canScrollNext/Prev:
    // with containScroll:"keepSnaps", those return true even when all slides fit.
    const canScroll = api.containerNode().scrollWidth > api.rootNode().clientWidth;
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
