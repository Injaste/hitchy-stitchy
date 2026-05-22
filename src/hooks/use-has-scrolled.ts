import { useEffect, useRef, useState } from "react";
import { useScrollContext } from "@/components/custom/scroll-view";

export const useHasScrolled = (locked = false) => {
  const ctx = useScrollContext();
  const [windowScrolled, setWindowScrolled] = useState(false);
  const frozenValue = useRef<boolean | null>(null);

  useEffect(() => {
    if (ctx) return;
    const onScroll = () => setWindowScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ctx]);

  const current = ctx ? ctx.hasScrolled : windowScrolled;

  // While unlocked, keep frozenValue up to date so it always captures
  // the latest value just before a lock begins.
  if (!locked) frozenValue.current = current;

  // When locked, return the value that was captured at lock time,
  // not a forced false — so a scrolled header stays collapsed and
  // an unscrolled header stays expanded for the duration of the drag.
  return locked ? (frozenValue.current ?? current) : current;
};
