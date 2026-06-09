import { type FC, useEffect } from "react";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { AnimatePresence, motion } from "framer-motion";

import { itemFadeIn, itemFadeUp } from "@/lib/animations";

import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useActiveTimelineQuery } from "../queries";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DayTabsProps {
  dates: string[];
  activeDate: string;
  onSelect: (date: string) => void;
}

const DayTabs: FC<DayTabsProps> = ({ dates, activeDate, onSelect }) => {
  const { data: active } = useActiveTimelineQuery();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayIndex = dates.indexOf(todayStr);
  const activeDayIndex = active ? dates.indexOf(active.day) : -1;

  // Where the rail lands: the live item's day first, then today, then day 1.
  const targetIndex =
    activeDayIndex >= 0 ? activeDayIndex : todayIndex >= 0 ? todayIndex : 0;

  // Position there on mount via startIndex, then re-center reactively if the
  // live day moves (mirrors the card carousel). targetIndex is a stable number,
  // so the effect only fires on a real change — it won't fight a user who has
  // scrolled the rail themselves.
  const { emblaRef, emblaApi } = useEmblaCarouselApi("start", targetIndex);
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(targetIndex);
  }, [emblaApi, targetIndex]);

  return (
    <div className="mb-6">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            <AnimatePresence>
              {dates.map((date, idx) => {
                const parsed = parseLocalDate(date);
                const active = date === activeDate;
                const isToday = date === todayStr;
                return (
                  <motion.div
                    key={date}
                    custom={idx}
                    variants={itemFadeUp}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    layout
                    className="flex flex-col items-center gap-1.5"
                  >
                  <button
                    type="button"
                    onClick={() => onSelect(date)}
                    aria-pressed={active}
                    className={cn(
                      "group/timeline-day-tab w-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm cursor-pointer transition-transform active:scale-[0.95]",
                    )}
                  >
                    <div
                      className={cn(
                        "py-1 text-2xs font-semibold uppercase tracking-widest transition-colors group-hover/timeline-day-tab:bg-primary/30",
                        active
                          ? "bg-primary/90! text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {format(parsed, "MMM")}
                    </div>
                    <div className="py-2">
                      <div className="font-display text-2xl font-bold leading-none text-foreground">
                        {format(parsed, "d")}
                      </div>
                      <div className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
                        {format(parsed, "EEE")}
                      </div>
                    </div>
                  </button>

                  {isToday ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Today
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Day {idx + 1}
                    </span>
                  )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Left fade — only when scrolled */}
        {showLeftFade && (
          <motion.div
            variants={itemFadeIn}
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent"
          />
        )}

        {/* Right fade — only when more content */}
        {showRightFade && (
          <motion.div
            variants={itemFadeIn}
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent"
          />
        )}
      </div>
      <Separator className="mt-6" />
    </div>
  );
};

export default DayTabs;
