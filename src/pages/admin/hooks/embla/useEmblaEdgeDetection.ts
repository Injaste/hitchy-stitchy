import { useState, useEffect, useCallback } from 'react'
import type { EmblaCarouselType } from 'embla-carousel'

export const useEmblaEdgeDetection = (emblaApi: EmblaCarouselType | undefined) => {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateEdges = useCallback((api: EmblaCarouselType) => {
    const progress = api.scrollProgress();
    const watchDrag = api.canScrollPrev() || api.canScrollNext();
    setShowLeftFade(progress > 0 && watchDrag);
    setShowRightFade(progress < 1 && watchDrag);
  }, [])

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("scroll", updateEdges);
    emblaApi.on("reInit", updateEdges);

    updateEdges(emblaApi);

    return () => {
      emblaApi.off("scroll", updateEdges).off("reInit", updateEdges);
    }
  }, [emblaApi, updateEdges]);

  return { showLeftFade, showRightFade }
}
