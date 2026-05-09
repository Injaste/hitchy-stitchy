import { useCallback, useEffect, useRef, useState } from "react";
import { type LenisRef } from "lenis/react";

export function useScrollVisibility() {
  const scrollRef = useRef<LenisRef>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current?.wrapper;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current?.wrapper;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return { scrollRef, canScrollUp, canScrollDown, onScroll: update };
}