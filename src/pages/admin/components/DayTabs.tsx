import { useEffect } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import DateTile from "@/components/custom/date-tile";
import { itemFadeIn, itemFadeUp } from "@/lib/animations";

import { useEmblaCarouselApi } from "../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../hooks/embla/useEmblaEdgeDetection";
import { useEventDaysQuery } from "../days/queries";
import { useActiveDay } from "../store/useActiveDay";

/**
 * Global day selector, shared across day-scoped admin pages (timeline, budget).
 * Renders the event's days as a scrollable rail and drives the global
 * `useActiveDay` selection. Hidden on single-day events — there's no day to
 * choose, so the page stays flat (mirrors the timeline before a 2nd day exists).
 */
const DayTabs = () => {
  const { data: days = [] } = useEventDaysQuery();
  const { activeDayId, setActiveDay } = useActiveDay();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const targetIndex = Math.max(
    0,
    days.findIndex((d) => d.id === activeDayId),
  );
  const { emblaRef, emblaApi } = useEmblaCarouselApi("start", targetIndex);
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(targetIndex);
  }, [emblaApi, targetIndex]);

  if (days.length <= 1) return null;

  return (
    <div className="mb-6">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            <AnimatePresence>
              {days.map((day, idx) => {
                const isActive = day.id === activeDayId;
                const isToday = day.date === todayStr;
                return (
                  <motion.div
                    key={day.id}
                    custom={idx}
                    variants={itemFadeUp}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    layout
                  >
                    <DateTile
                      date={day.date}
                      active={isActive}
                      onClick={() => setActiveDay(day.id)}
                      label={
                        <span
                          className={cn(
                            isToday
                              ? "inline-flex items-center gap-1 font-medium text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {isToday && (
                            <span className="size-1.5 rounded-full bg-primary" />
                          )}
                          {day.label}
                        </span>
                      }
                    />
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
