import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";

import { cn } from "@/lib/utils";
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
  /** Overlay thumb thickness. "normal" for page-level scrolls, "thin" elsewhere. */
  size?: "thin" | "normal";
  /**
   * Hide the overlay scrollbar entirely while keeping the surface scrollable
   * (wheel/touch/keyboard). For places that cue scrollability another way — e.g.
   * the setup guide, which uses edge fades + chevrons instead of a thumb.
   */
  hideScrollbar?: boolean;
  /**
   * Cap the scroll region at a fixed px height (grow-to-fit, then scroll). Omit
   * to fill the parent (the default). Used by the data table's fixed-height body.
   */
  maxHeight?: number;
  /** Fires on each viewport scroll (e.g. to keep a parent framed in view). */
  onScroll?: () => void;
};

// Every scroll surface uses a macOS/mobile-style OverlayScrollbars overlay
// scrollbar — thin, auto-hiding, reserves no space, consistent across OS and
// browser (vs the native bar: chunky always-on on Windows, auto-hiding Fluent
// overlay in Win11 Chrome). The optional edge fades cue scrollability while the
// thumb is hidden. Theme + sizing live in `.os-theme-app` (index.css).
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
  ...props
}: ScrollViewProps) => {
  const [selfScrolled, setSelfScrolled] = useState(false);
  const [sourceScrolled, setSourceScrolled] = useState(false);
  const sourcesRef = useRef<Map<string, boolean>>(new Map());

  // Scrollability flags for the edge fades, read from the OverlayScrollbars
  // viewport on init / scroll / resize.
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const update = useCallback(
    (inst: OverlayScrollbars) => {
      const vp = inst.elements().viewport;
      const up = vp.scrollTop > 0;
      const down = vp.scrollTop + vp.clientHeight < vp.scrollHeight - 1;
      const left = vp.scrollLeft > 0;
      const right = vp.scrollLeft + vp.clientWidth < vp.scrollWidth - 1;
      setCanScrollUp(up);
      setCanScrollDown(down);
      setCanScrollLeft(left);
      setCanScrollRight(right);
      // hasScrolled (the dialog header shadow cue) tracks the primary axis only.
      const started = axis === "x" ? left : up;
      setSelfScrolled((cur) => (cur === started ? cur : started));
    },
    [axis],
  );

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

  const hasScrolled = selfScrolled || sourceScrolled;

  const ctx = useMemo<ScrollContextValue>(
    () => ({ hasScrolled, registerSource }),
    [hasScrolled, registerSource],
  );

  return (
    <ScrollContext.Provider value={ctx}>
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
        <OverlayScrollbarsComponent
          element="div"
          className={cn(
            maxHeight === undefined && "h-full",
            "pb-1",
            size === "normal" && "os-scroll-normal",
            className,
          )}
          style={maxHeight !== undefined ? { maxHeight } : undefined}
          options={{
            overflow:
              axis === "x"
                ? { x: "scroll", y: "hidden" }
                : { x: "hidden", y: "scroll" },
            scrollbars: {
              autoHide: "leave",
              autoHideDelay: 600,
              theme: "os-theme-app",
              visibility: hideScrollbar ? "hidden" : "auto",
            },
          }}
          events={{
            initialized: update,
            updated: update,
            scroll: (inst) => {
              update(inst);
              onScroll?.();
            },
          }}
          defer
        >
          {children}
        </OverlayScrollbarsComponent>
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
