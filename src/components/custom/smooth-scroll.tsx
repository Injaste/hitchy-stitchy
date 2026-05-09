import { forwardRef } from "react";
import { Lenis, type LenisRef } from "lenis/react";
import { cn } from "@/lib/utils";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";

type SmoothScrollProps = Omit<React.ComponentProps<"div">, "ref"> & {
  gradient?: boolean;
  gradientClass?: string;
};

export const SmoothScroll = forwardRef<LenisRef, SmoothScrollProps>(
  (
    {
      children,
      className,
      gradient = false,
      gradientClass = "from-background",
      ...props
    },
    ref,
  ) => {
    const { scrollRef, canScrollUp, canScrollDown, onScroll } =
      useScrollVisibility();

    return (
      <div className="relative flex flex-col flex-1 h-full p-1 -m-1">
        {gradient && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b to-transparent transition-opacity duration-200",
              gradientClass,
              canScrollUp ? "opacity-100" : "opacity-0",
            )}
          />
        )}
        <Lenis
          ref={ref ?? scrollRef}
          onScroll={gradient ? onScroll : undefined}
          options={{ duration: 1.2, syncTouch: true }}
          className={cn("overflow-y-auto p-1 -m-1", className)}
          {...props}
        >
          {children}
        </Lenis>
        {gradient && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-linear-to-t to-transparent transition-opacity duration-200",
              gradientClass,
              canScrollDown ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </div>
    );
  },
);

export type { SmoothScrollProps };
