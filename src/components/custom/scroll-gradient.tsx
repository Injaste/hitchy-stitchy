import type { FC } from "react";

import { cn } from "@/lib/utils";

interface ScrollGradientProps {
  side: "top" | "bottom";
  visible: boolean;
  /**
   * Tailwind color class that drives `from-<color>` in the gradient.
   * Default `from-background` matches the page surface.
   */
  fromClass?: string;
  /** Override the gradient height. Default h-6 (~24px). */
  heightClass?: string;
  className?: string;
}

/**
 * Pointer-events-none gradient overlay anchored to the top or bottom of a
 * `position: relative` scroll container. Fades in when its side is
 * scrollable. Shared between ScrollView (page-level) and the tasks
 * board's column scrollbars, so the visual is consistent.
 */
const ScrollGradient: FC<ScrollGradientProps> = ({
  side,
  visible,
  fromClass = "from-background",
  heightClass = "h-6",
  className,
}) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-x-0 z-10 transition-opacity duration-300 to-transparent",
      heightClass,
      side === "top"
        ? "top-0 bg-linear-to-b"
        : "bottom-0 bg-linear-to-t",
      fromClass,
      visible ? "opacity-100" : "opacity-0",
      className,
    )}
  />
);

export default ScrollGradient;
