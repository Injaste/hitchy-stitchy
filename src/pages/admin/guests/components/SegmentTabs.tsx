import { useEffect, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { itemFadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-media-query";

import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { RSVP_MODE_META } from "../../invitation/rsvpMeta";
import type { RSVPMode } from "../../invitation/types";

export interface SegmentTabsOption {
  /** Invitation page id, or null for the "All pages of the day" pill. */
  id: string | null;
  label: string;
  count: number;
  /** The page's RSVP mode — shown as a leading icon. Omitted for "All". */
  mode?: RSVPMode;
}

interface SegmentTabsProps {
  options: SegmentTabsOption[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Page selector within the active day. Only rendered when a day holds more than
 * one invitation page — a single-page day needs no split. A horizontal embla
 * rail (matching the task LabelTabs / day rail) so many segments scroll rather
 * than wrap; each pill carries its guest count, and "All" aggregates the day.
 */
const SegmentTabs: FC<SegmentTabsProps> = ({
  options,
  activeId,
  onSelect,
}) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);
  const isMobile = useIsMobile();

  // Re-measure when the page set changes (e.g. switching days).
  const optionsKey = options.map((o) => o.id ?? "all").join("|");
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, optionsKey]);

  return (
    <div
      role="group"
      aria-label="Filter by invitation page"
      className="relative -mx-1"
    >
      <div ref={emblaRef} className="overflow-hidden p-1">
        <div className="flex gap-1.5">
          {options.map((opt) => {
            const isActive = opt.id === activeId;
            const ModeIcon = opt.mode ? RSVP_MODE_META[opt.mode].icon : null;
            return (
              <Button
                key={opt.id ?? "all"}
                type="button"
                size={isMobile ? "sm" : "md"}
                variant={isActive ? "default" : "outline"}
                onClick={() => onSelect(opt.id)}
                className={cn(
                  "shrink-0 text-xs",
                  !isActive && "bg-transparent text-muted-foreground",
                )}
              >
                {ModeIcon && (
                  <ModeIcon
                    className={cn(
                      "size-3.5 shrink-0",
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground/80",
                    )}
                  />
                )}
                {opt.label}
                <span
                  className={cn(
                    "ml-1.5 tabular-nums",
                    isActive
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground/70",
                  )}
                >
                  {opt.count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showLeftFade && (
          <motion.div
            key="left"
            variants={itemFadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="pointer-events-none absolute inset-y-0 left-0 flex w-16 items-center bg-linear-to-r from-background to-transparent"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Scroll pages left"
              className="pointer-events-auto ml-1 size-7 rounded-full shadow-sm backdrop-blur-sm"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </motion.div>
        )}

        {showRightFade && (
          <motion.div
            key="right"
            variants={itemFadeIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end bg-linear-to-l from-background to-transparent"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Scroll pages right"
              className="pointer-events-auto mr-1 size-7 rounded-full shadow-sm backdrop-blur-sm"
            >
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SegmentTabs;
