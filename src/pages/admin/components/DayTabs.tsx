import { useEffect } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import DateTile from "@/components/custom/date-tile";
import { itemFadeIn, itemFadeUp } from "@/lib/animations";

import { useEmblaCarouselApi } from "../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../hooks/embla/useEmblaEdgeDetection";
import { useActiveEventDay } from "../hooks/useActiveEventDay";
import { dayLabel } from "../days/utils";
import type { EventDay } from "../days/types";

interface DayTabsProps {
  /** Controlled mode: render this day list instead of the global event days
   *  (e.g. gifts renders only days that have gifts). Omit for the default global
   *  behaviour (budget / timeline). */
  days?: EventDay[];
  activeDayId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * Day selector rail, shared across day-scoped admin pages (timeline, budget).
 * Uncontrolled (default) it renders all event days and drives the global
 * `useActiveDay` selection. Controlled (pass `days`) it renders a given subset
 * and calls `onSelect`. Hidden when there's ≤1 day — the page stays flat.
 */
const DayTabs = ({
  days: daysProp,
  activeDayId: activeProp,
  onSelect,
}: DayTabsProps = {}) => {
  const global = useActiveEventDay();
  const controlled = daysProp !== undefined;
  const days = daysProp ?? global.days;
  const activeDayId = controlled ? activeProp ?? null : global.activeDayId;
  const setActiveDay = controlled
    ? onSelect ?? (() => {})
    : global.setActiveDay;
  const activeIndex = controlled
    ? Math.max(
        0,
        days.findIndex((d) => d.id === activeDayId),
      )
    : global.activeIndex;
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const { emblaRef, emblaApi } = useEmblaCarouselApi("start", activeIndex);
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(activeIndex);
  }, [emblaApi, activeIndex]);

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
                          {dayLabel(day.label, idx)}
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
