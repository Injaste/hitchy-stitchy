import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollVisibility() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  // Content can change without the scroll box itself resizing — rows arriving,
  // a list filtering down — which the ResizeObserver above never sees, leaving
  // the edge flags stale. Those changes are React-driven, so re-measure after
  // every render; setState bails out when nothing changed, so it costs nothing.
  useEffect(update);

  return {
    scrollRef,
    canScrollUp,
    canScrollDown,
    canScrollLeft,
    canScrollRight,
    onScroll: update,
  };
}
