import { useRef, useState, useEffect, useCallback } from "react";
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

/**
 * DELIBERATE DUPLICATE of `pages/admin/hooks/embla/*`. Home and admin are
 * bundled as independent sites, and a shared module would land in `shared`,
 * which loads on every route — including the wedding invite, which has no
 * carousels at all. See `docs/architecture/bundling.md`. Do not "dedupe" these
 * into a common hook; fix both copies instead.
 */

// ── useEmblaCarouselApi ────────────────────────────────────────────────────

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
  }, []);

  return { emblaRef, emblaApi };
};

// ── useEmblaEdgeDetection ─────────────────────────────────────────────────

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
