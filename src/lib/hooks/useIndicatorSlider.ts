import { useRef, useCallback, type RefObject, useEffect } from "react";
import { useAnimate, type AnimationScope } from "framer-motion";

type Direction = "vertical" | "horizontal";

interface IndicatorSliderResult {
  containerRef: RefObject<HTMLElement | null>;
  hoverIndicatorRef: AnimationScope<HTMLDivElement>;
  activeIndicatorRef: AnimationScope<HTMLDivElement>;
  setRef: (id: string) => (el: HTMLElement | null) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export default function useIndicatorSlider(
  direction: Direction = "vertical",
  activeId?: string,
): IndicatorSliderResult {
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const containerRef = useRef<HTMLElement | null>(null);
  const [hoverScope, hoverAnimate] = useAnimate();
  const [activeScope, activeAnimate] = useAnimate();

  const getValuesForId = useCallback(
    (id: string) => {
      const item = itemRefs.current[id];
      const container = containerRef.current;
      if (!item || !container) return null;

      const itemRect = item.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (direction === "horizontal") {
        return {
          primary: itemRect.left - containerRect.left + container.scrollLeft,
          secondary: itemRect.width,
        };
      }

      return {
        primary: itemRect.top - containerRect.top + container.scrollTop,
        secondary: itemRect.height,
      };
    },
    [direction],
  );

  const applyHoverValues = useCallback(
    (id: string) => {
      const values = getValuesForId(id);
      if (!values || !hoverScope.current) return;

      const target =
        direction === "horizontal"
          ? { left: values.primary, width: values.secondary, opacity: 1 }
          : { top: values.primary, height: values.secondary, opacity: 1 };

      hoverAnimate(hoverScope.current, target, {
        type: "spring",
        stiffness: 400,
        damping: 30,
      });
    },
    [direction, getValuesForId, hoverAnimate, hoverScope],
  );

  const applyActiveValues = useCallback(
    (id: string) => {
      const values = getValuesForId(id);
      if (!values || !activeScope.current) return;

      const target =
        direction === "horizontal"
          ? { left: values.primary, width: values.secondary }
          : { top: values.primary, height: values.secondary };

      activeAnimate(activeScope.current, target, {
        type: "spring",
        stiffness: 400,
        damping: 30,
      });
    },
    [direction, getValuesForId, activeAnimate, activeScope],
  );

  const onMouseEnter = useCallback(
    (id: string) => applyHoverValues(id),
    [applyHoverValues],
  );

  // Update active slider when activeId changes
  useEffect(() => {
    if (!activeId) return;
    applyActiveValues(activeId);
  }, [activeId, applyActiveValues]);

  const onMouseLeave = useCallback(() => {
    if (hoverScope.current) {
      hoverAnimate(hoverScope.current, { opacity: 0 }, { duration: 0.15 });
    }
  }, [hoverAnimate, hoverScope]);

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      itemRefs.current[id] = el;
    },
    [],
  );

  return {
    containerRef,
    hoverIndicatorRef: hoverScope,
    activeIndicatorRef: activeScope,
    setRef,
    onMouseEnter,
    onMouseLeave,
  };
}
