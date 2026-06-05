import { type FC } from "react";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { AnimatePresence, motion } from "framer-motion";

import { itemFadeIn, itemFadeUp } from "@/lib/animations";

import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DayTabsProps {
  days: string[];
  activeDayId: string;
  onSelect: (id: string) => void;
}

const DayTabs: FC<DayTabsProps> = ({ days, activeDayId, onSelect }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mb-6">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            <AnimatePresence>
              {days.map((day, idx) => {
                const date = parseLocalDate(day);
                const active = day === activeDayId;
                const isToday = day === todayStr;
                return (
                  <motion.div
                    key={day}
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
                    onClick={() => onSelect(day)}
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
                      {format(date, "MMM")}
                    </div>
                    <div className="py-2">
                      <div className="font-display text-2xl font-bold leading-none text-foreground">
                        {format(date, "d")}
                      </div>
                      <div className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
                        {format(date, "EEE")}
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
