import { useRef, useCallback, type RefObject, useEffect } from "react";
import { useAnimate, type AnimationScope } from "framer-motion";

type Direction = "vertical" | "horizontal";

interface HoverIndicatorResult {
  containerRef: RefObject<HTMLElement | null>;
  indicatorRef: AnimationScope<HTMLDivElement>;
  setRef: (id: string) => (el: HTMLElement | null) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export default function useHoverIndicator(
  direction: Direction = "vertical",
  activeId?: string,
): HoverIndicatorResult {
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const containerRef = useRef<HTMLElement | null>(null);
  const [scope, animate] = useAnimate();

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

  const applyValues = useCallback(
    (id: string) => {
      const values = getValuesForId(id);
      if (!values || !scope.current) return;

      const target =
        direction === "horizontal"
          ? { left: values.primary, width: values.secondary, opacity: 1 }
          : { top: values.primary, height: values.secondary, opacity: 1 };

      animate(scope.current, target, {
        type: "spring",
        stiffness: 400,
        damping: 30,
      });
    },
    [direction, getValuesForId, animate, scope],
  );

  const onMouseEnter = useCallback(
    (id: string) => applyValues(id),
    [applyValues],
  );

  useEffect(() => {
    if (!activeId) return;
    applyValues(activeId);
  }, [activeId, applyValues]);

  const onMouseLeave = useCallback(() => {
    if (activeId) {
      applyValues(activeId);
      return;
    }
    if (scope.current) {
      animate(scope.current, { opacity: 0 }, { duration: 0.15 });
    }
  }, [activeId, applyValues, animate, scope]);

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      itemRefs.current[id] = el;
    },
    [],
  );

  return {
    containerRef,
    indicatorRef: scope,
    setRef,
    onMouseEnter,
    onMouseLeave,
  };
}
