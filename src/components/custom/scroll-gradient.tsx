import type { CSSProperties, FC } from "react";

import { cn } from "@/lib/utils";

interface ScrollGradientProps {
  side: "top" | "bottom" | "left" | "right";
  visible: boolean;
  /** Inline overrides — e.g. a dynamic `top` offset that can't be a Tailwind class. */
  style?: CSSProperties;
  /**
   * Tailwind color class that drives `from-<color>` in the gradient.
   * Default `from-background` matches the page surface.
   */
  fromClass?: string;
  /**
   * Override the gradient thickness — height for top/bottom, width for
   * left/right. Default h-10 / w-10 (~40px).
   */
  sizeClass?: string;
  className?: string;
}

const SIDE_CLASS: Record<ScrollGradientProps["side"], string> = {
  top: "inset-x-0 -top-px bg-linear-to-b",
  bottom: "inset-x-0 -bottom-px bg-linear-to-t",
  left: "inset-y-0 -left-px bg-linear-to-r",
  right: "inset-y-0 -right-px bg-linear-to-l",
};

/**
 * Pointer-events-none gradient overlay anchored to an edge of a
 * `position: relative` scroll container. Fades in when its side is
 * scrollable. Shared between ScrollView (page-level), the tasks board's
 * column scrollbars (vertical), and the board's horizontal overflow, so
 * the visual is consistent across axes.
 */
const ScrollGradient: FC<ScrollGradientProps> = ({
  side,
  visible,
  fromClass = "from-background",
  sizeClass,
  className,
  style,
}) => {
  const isHorizontal = side === "left" || side === "right";
  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "pointer-events-none absolute z-10 transition-opacity to-transparent",
        sizeClass ?? (isHorizontal ? "w-10" : "h-10"),
        SIDE_CLASS[side],
        fromClass,
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
};

export default ScrollGradient;
