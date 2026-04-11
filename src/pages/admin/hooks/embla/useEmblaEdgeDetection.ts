import { useState, useEffect, useCallback } from 'react'
import type { EmblaCarouselType } from 'embla-carousel'

export const useEmblaEdgeDetection = (emblaApi: EmblaCarouselType | undefined) => {
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)

  const updateEdges = useCallback((api: EmblaCarouselType) => {
    const progress = api.scrollProgress()
    setIsAtStart(progress > 0);
    setIsAtEnd(progress < 1);
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.on("scroll", updateEdges)
    emblaApi.on("reInit", updateEdges)

    updateEdges(emblaApi)

    return () => {
      emblaApi.off("scroll", updateEdges).off("reInit", updateEdges)
    }
  }, [emblaApi, updateEdges])

  return { isAtStart, isAtEnd }
}
