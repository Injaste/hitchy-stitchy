import {
  createContext,
  forwardRef,
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

type ScrollViewProps = React.ComponentProps<"div"> & {
  gradientTop?: boolean;
  gradientBottom?: boolean;
  gradientClass?: string;
};

export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(
  (
    {
      children,
      className,
      gradientTop = false,
      gradientBottom = false,
      gradientClass = "from-background",
      onScroll,
      ...props
    },
    ref,
  ) => {
    const {
      scrollRef,
      canScrollUp,
      canScrollDown,
      onScroll: onScrollUpdate,
    } = useScrollVisibility();
    const anyGradient = gradientTop || gradientBottom;
    const [selfScrolled, setSelfScrolled] = useState(false);
    const [sourceScrolled, setSourceScrolled] = useState(false);
    const sourcesRef = useRef<Map<string, boolean>>(new Map());

    const setRefs = (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
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

    const hasScrolled = selfScrolled || sourceScrolled;

    const ctx = useMemo<ScrollContextValue>(
      () => ({ hasScrolled, registerSource }),
      [hasScrolled, registerSource],
    );

    return (
      <ScrollContext.Provider value={ctx}>
        <div className="relative flex flex-col flex-1 h-full">
          {gradientTop && (
            <ScrollGradient
              side="top"
              visible={canScrollUp}
              fromClass={gradientClass}
              heightClass="h-8"
            />
          )}
          <div
            ref={setRefs}
            onScroll={(e) => {
              if (anyGradient) onScrollUpdate();
              const scrolled = e.currentTarget.scrollTop > 0;
              setSelfScrolled((cur) => (cur === scrolled ? cur : scrolled));
              onScroll?.(e);
            }}
            className={cn("h-full overflow-y-auto pb-1", className)}
            {...props}
          >
            {children}
          </div>
          {gradientBottom && (
            <ScrollGradient
              side="bottom"
              visible={canScrollDown}
              fromClass={gradientClass}
              heightClass="h-8"
            />
          )}
        </div>
      </ScrollContext.Provider>
    );
  },
);

export type { ScrollViewProps };
