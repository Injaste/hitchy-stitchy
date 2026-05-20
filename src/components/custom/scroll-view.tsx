import { createContext, forwardRef, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";

type ScrollContextValue = {
  hasScrolled: boolean;
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
    const [hasScrolled, setHasScrolled] = useState(false);

    const setRefs = (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const ctx = useMemo(() => ({ hasScrolled }), [hasScrolled]);

    return (
      <ScrollContext.Provider value={ctx}>
        <div className="relative flex flex-col flex-1 h-full">
          {gradientTop && (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b to-transparent transition-opacity duration-500",
                gradientClass,
                canScrollUp ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <div
            ref={setRefs}
            onScroll={(e) => {
              if (anyGradient) onScrollUpdate();
              setHasScrolled(e.currentTarget.scrollTop > 0);
              onScroll?.(e);
            }}
            className={cn("overflow-y-auto", className)}
            {...props}
          >
            {children}
          </div>
          {gradientBottom && (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-linear-to-t to-transparent transition-opacity duration-500",
                gradientClass,
                canScrollDown ? "opacity-100" : "opacity-0",
              )}
            />
          )}
        </div>
      </ScrollContext.Provider>
    );
  },
);

export type { ScrollViewProps };
