import type { CSSProperties, FC } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

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
  /**
   * Pin a chevron pointing toward the scrollable edge inside the fade — the
   * select-content scroll affordance (gradient + chevron). Off by default.
   */
  chevron?: boolean;
  className?: string;
}

const SIDE_CLASS: Record<ScrollGradientProps["side"], string> = {
  top: "inset-x-0 top-0 bg-linear-to-b",
  bottom: "inset-x-0 bottom-0 bg-linear-to-t",
  left: "inset-y-0 left-0 bg-linear-to-r",
  right: "inset-y-0 right-0 bg-linear-to-l",
};

// Chevron icon + alignment that pins it to the scrollable edge of the fade.
const CHEVRON: Record<
  ScrollGradientProps["side"],
  { Icon: LucideIcon; align: string }
> = {
  top: { Icon: ChevronUp, align: "justify-center items-start pt-1" },
  bottom: { Icon: ChevronDown, align: "justify-center items-end pb-1" },
  left: { Icon: ChevronLeft, align: "items-center justify-start pl-1" },
  right: { Icon: ChevronRight, align: "items-center justify-end pr-1" },
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
  chevron = false,
}) => {
  const isHorizontal = side === "left" || side === "right";
  const { Icon, align } = CHEVRON[side];
  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "pointer-events-none absolute z-10 transition-opacity to-transparent",
        sizeClass ?? (isHorizontal ? "w-10" : "h-10"),
        SIDE_CLASS[side],
        fromClass,
        chevron && cn("flex text-muted-foreground", align),
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {chevron && <Icon className="size-4" />}
    </div>
  );
};

export default ScrollGradient;
