import { useRef, useState, useEffect, useCallback } from "react";
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
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
  const viewportRef = useRef<HTMLElement | null>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | undefined>();

  // Capture options in refs so the effect closure doesn't need them as deps.
  const alignRef = useRef(align);
  const startIndexRef = useRef(startIndex);

  const emblaRef = useCallback((node: HTMLElement | null) => {
    viewportRef.current = node;
  }, []);

  // Init once per mount against the live node. Empty deps + a ref (rather than
  // embla-carousel-react's useState-setter-as-ref) sidesteps the React 18
  // batching quirk that left Embla destroyed under Strict Mode. Embla runs its
  // own ResizeObserver on the root and slides, so it re-measures itself when a
  // hidden wrapper (hidden md:block) reveals or a parent animates in from 0 —
  // no manual reInit needed here.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const api = EmblaCarousel(
      node,
      {
        containScroll: "keepSnaps",
        align: alignRef.current,
        // Default to 0 rather than passing `startIndex: undefined`, which would
        // override Embla's own default of 0 (objectsMergeDeep copies the
        // undefined over it) → Counter resolves to NaN → scrollSnaps[NaN] is
        // undefined → the engine's location/target/offsetLocation all become
        // NaN, and scrollProgress() returns NaN, breaking drag and fades on any
        // carousel that overflows.
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
