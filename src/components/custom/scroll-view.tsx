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

type ScrollViewProps = React.ComponentProps<"div"> & {
  mainClass?: string;
  gradientTop?: boolean;
  gradientBottom?: boolean;
  gradientClass?: string;
  /** Overlay thumb thickness. "normal" for page-level scrolls, "thin" elsewhere. */
  size?: "thin" | "normal";
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
  gradientTop = false,
  gradientBottom = false,
  gradientClass = "from-background",
  size = "thin",
  ...props
}: ScrollViewProps) => {
  const [selfScrolled, setSelfScrolled] = useState(false);
  const [sourceScrolled, setSourceScrolled] = useState(false);
  const sourcesRef = useRef<Map<string, boolean>>(new Map());

  // Scrollability flags for the edge fades, read from the OverlayScrollbars
  // viewport on init / scroll / resize.
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const update = useCallback((inst: OverlayScrollbars) => {
    const vp = inst.elements().viewport;
    const up = vp.scrollTop > 0;
    const down = vp.scrollTop + vp.clientHeight < vp.scrollHeight - 1;
    setCanScrollUp(up);
    setCanScrollDown(down);
    setSelfScrolled((cur) => (cur === up ? cur : up));
  }, []);

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
        className={cn("relative flex flex-col flex-1 h-full", mainClass)}
        {...props}
      >
        {gradientTop && (
          <ScrollGradient
            side="top"
            visible={canScrollUp}
            fromClass={gradientClass}
          />
        )}
        <OverlayScrollbarsComponent
          element="div"
          className={cn(
            "h-full pb-1",
            size === "normal" && "os-scroll-normal",
            className,
          )}
          options={{
            overflow: { x: "hidden", y: "scroll" },
            scrollbars: {
              autoHide: "leave",
              autoHideDelay: 600,
              theme: "os-theme-app",
            },
          }}
          events={{ initialized: update, updated: update, scroll: update }}
          defer
        >
          {children}
        </OverlayScrollbarsComponent>
        {gradientBottom && (
          <ScrollGradient
            side="bottom"
            visible={canScrollDown}
            fromClass={gradientClass}
          />
        )}
      </div>
    </ScrollContext.Provider>
  );
};

export type { ScrollViewProps };
