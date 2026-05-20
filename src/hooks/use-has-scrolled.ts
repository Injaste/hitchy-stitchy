import { useEffect, useState } from "react";
import { useScrollContext } from "@/components/custom/scroll-view";

export const useHasScrolled = () => {
  const ctx = useScrollContext();
  const [windowScrolled, setWindowScrolled] = useState(false);

  useEffect(() => {
    if (ctx) return;
    const onScroll = () => setWindowScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ctx]);

  return ctx ? ctx.hasScrolled : windowScrolled;
};
