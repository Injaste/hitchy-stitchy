import { useEffect, useId, useRef, type RefObject } from "react";
import { useScrollContext } from "@/components/custom/scroll-view";

/**
 * Attach a passive scroll listener to `ref` and report whether it's
 * scrolled past 0 to the nearest ScrollContext. Multiple sources are
 * OR'd together — any one scrolled = parent hasScrolled.
 *
 * Pass `enabled = false` to opt out (e.g. mobile branch).
 */
export const useRegisterScrollSource = (
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) => {
  const ctx = useScrollContext();
  const id = useId();
  const lastReportedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!enabled || !ctx) return;
    const el = ref.current;
    if (!el) return;

    const report = () => {
      const scrolled = el.scrollTop > 0;
      if (lastReportedRef.current === scrolled) return;
      lastReportedRef.current = scrolled;
      ctx.registerSource(id, scrolled);
    };

    report();
    el.addEventListener("scroll", report, { passive: true });
    return () => {
      el.removeEventListener("scroll", report);
      ctx.registerSource(id, false);
      lastReportedRef.current = null;
    };
  }, [ref, ctx, id, enabled]);
};
