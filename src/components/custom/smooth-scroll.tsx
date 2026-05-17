import { forwardRef } from "react";
import { Lenis, type LenisRef } from "lenis/react";
import { cn } from "@/lib/utils";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";

type SmoothScrollProps = Omit<React.ComponentProps<"div">, "ref"> & {
  gradientTop?: boolean;
  gradientBottom?: boolean;
  gradientClass?: string;
};

export const SmoothScroll = forwardRef<LenisRef, SmoothScrollProps>(
  (
    {
      children,
      className,
      gradientTop = false,
      gradientBottom = false,
      gradientClass = "from-background",
      ...props
    },
    ref,
  ) => {
    const { scrollRef, canScrollUp, canScrollDown, onScroll } =
      useScrollVisibility();
    const anyGradient = gradientTop || gradientBottom;

    return (
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
        <Lenis
          ref={ref ?? scrollRef}
          onScroll={anyGradient ? onScroll : undefined}
          options={{ duration: 1.2, syncTouch: true }}
          className={cn("overflow-y-auto p-1", className)}
          {...props}
        >
          {children}
        </Lenis>
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
    );
  },
);

export type { SmoothScrollProps };
