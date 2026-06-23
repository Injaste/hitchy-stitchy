import { useState, useEffect, useCallback } from "react";
import type { EmblaCarouselType } from "embla-carousel";

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
