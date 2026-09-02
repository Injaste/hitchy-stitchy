import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import ScrollGradient from "./scroll-gradient";

type ScrollContextValue = {
  hasScrolled: boolean;
  registerSource: (id: string, scrolled: boolean) => void;
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

export const useScrollContext = () => useContext(ScrollContext);

type ScrollViewProps = Omit<React.ComponentProps<"div">, "onScroll"> & {
  mainClass?: string;
  /** Scroll axis. "y" (default) scrolls vertically; "x" scrolls horizontally. */
  axis?: "x" | "y";
  gradientTop?: boolean;
  gradientBottom?: boolean;
  gradientLeft?: boolean;
  gradientRight?: boolean;
  gradientClass?: string;
  /** Pin a chevron in each edge fade (select-content style) as a scroll cue. */
  gradientChevron?: boolean;
  /** Scrollbar thickness. "normal" for page-level scrolls, "thin" elsewhere. */
  size?: "thin" | "normal";
  /**
   * Hide the scrollbar entirely while keeping the surface scrollable
   * (wheel/touch/keyboard). For places that cue scrollability another way — the
   * setup guide's edge fades + chevrons, or a surface whose reserved gutter
   * would misalign it with sibling chrome (the data table's pinned header).
   */
  hideScrollbar?: boolean;
  /**
   * Cap the scroll region at a fixed px height (grow-to-fit, then scroll). Omit
   * to fill the parent (the default). Used by the data table's fixed-height body.
   */
  maxHeight?: number;
  /** Fires on each viewport scroll (e.g. to keep a parent framed in view). */
  onScroll?: () => void;
  /**
   * Hands the scrollable element up to the parent (null on teardown) — a row
   * virtualizer needs a direct handle to it as its scroll container.
   */
  onViewport?: (el: HTMLElement | null) => void;
};

// Every scroll surface is a plain overflow container with a native scrollbar,
// themed by `scroll-thin` / `scroll-normal` (index.css). The optional edge fades
// cue scrollability, and are the sole cue where `hideScrollbar` is set.
export const ScrollView = ({
  mainClass,
  children,
  className,
  axis = "y",
  gradientTop = false,
  gradientBottom = false,
  gradientLeft = false,
  gradientRight = false,
  gradientClass = "from-background",
  gradientChevron = false,
  size = "thin",
  hideScrollbar = false,
  maxHeight,
  onScroll,
  onViewport,
  ...props
}: ScrollViewProps) => {
  const [sourceScrolled, setSourceScrolled] = useState(false);
  const sourcesRef = useRef<Map<string, boolean>>(new Map());

  const {
    scrollRef,
    canScrollUp,
    canScrollDown,
    canScrollLeft,
    canScrollRight,
    onScroll: measure,
  } = useScrollVisibility();

  const setScrollEl = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      onViewport?.(el);
    },
    [scrollRef, onViewport],
  );

  const handleScroll = () => {
    measure();
    onScroll?.();
  };

  const registerSource = useCallback((id: string, scrolled: boolean) => {
    const map = sourcesRef.current;
    const prev = map.get(id);
    if (prev === scrolled) return;
    map.set(id, scrolled);
    let any = false;
    for (const v of map.values()) {
      if (v) {
        any = true;
        break;
      }
    }
    setSourceScrolled((cur) => (cur === any ? cur : any));
  }, []);

  // hasScrolled (the dialog header shadow cue) tracks the primary axis only.
  const selfScrolled = axis === "x" ? canScrollLeft : canScrollUp;
  const hasScrolled = selfScrolled || sourceScrolled;

  const ctx = useMemo<ScrollContextValue>(
    () => ({ hasScrolled, registerSource }),
    [hasScrolled, registerSource],
  );

  return (
    <ScrollContext.Provider value={ctx}>
      {/* RULE: padding belongs on the scroll element below, never here via
          `mainClass`. The gradients are absolutely positioned against this
          wrapper's padding box, so padding added here changes their reach
          instead of clearing content. It shipped correctly on the scroll
          element in 9522ec0 and was reverted here as a "tighten" drive-by in
          c69e1d3 — twice is enough; do not move it again. (The 1px bleed that
          used to live here as `py-px` now comes from ScrollGradient's own
          -top-px/-bottom-px, so this wrapper stays exactly the scroll box.) */}
      <div
        className={cn(
          "relative flex flex-col",
          maxHeight === undefined && "flex-1 h-full",
          mainClass,
        )}
        {...props}
      >
        {gradientTop && (
          <ScrollGradient
            side="top"
            visible={canScrollUp}
            fromClass={gradientClass}
            chevron={gradientChevron}
          />
        )}
        {gradientLeft && (
          <ScrollGradient
            side="left"
            visible={canScrollLeft}
            fromClass={gradientClass}
            chevron={gradientChevron}
          />
        )}
        <div
          ref={setScrollEl}
          onScroll={handleScroll}
          className={cn(
            // Ring clearance, unconditional. A 3px focus ring is a box-shadow
            // that this element clips, so every scroll surface owes 4px on all
            // sides. Constant by design: a shell subtracts it from its own gap
            // once (gap-3/gap-5) and the seam then measures the same whether
            // the body scrolls or not. Pass p-0 to opt out where the box must
            // sit flush — see data-table.
            "p-1",
            axis === "x"
              ? "overflow-x-auto overflow-y-hidden"
              : "overflow-y-auto overflow-x-hidden",
            maxHeight === undefined && "h-full",
            // No overscroll-behavior here on purpose: `contain` blocks scroll
            // chaining on BOTH axes, which strands a gesture the surface can't
            // consume itself — a horizontal swipe over a task column would never
            // reach the board behind it, and a wheel over an unscrollable column
            // would never reach the page. Dialogs don't need it either: Radix
            // locks the body with overflow:hidden + overscroll-behavior:contain
            // while one is open, so there's nothing behind left to move.
            hideScrollbar
              ? "no-scrollbar"
              : size === "normal"
                ? "scroll-normal"
                : "scroll-thin",
            className,
          )}
          style={maxHeight !== undefined ? { maxHeight } : undefined}
        >
          {children}
        </div>
        {gradientBottom && (
          <ScrollGradient
            side="bottom"
            visible={canScrollDown}
            fromClass={gradientClass}
            chevron={gradientChevron}
          />
        )}
        {gradientRight && (
          <ScrollGradient
            side="right"
            visible={canScrollRight}
            fromClass={gradientClass}
            chevron={gradientChevron}
          />
        )}
      </div>
    </ScrollContext.Provider>
  );
};

export type { ScrollViewProps };
