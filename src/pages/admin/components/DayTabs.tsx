import { useEffect } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
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
  /** Prepend an "All days" tile, active when `activeDayId` is null. For rails
   *  that FILTER rather than scope — vendors, where a vendor can span days and
   *  an untagged one belongs to no single tab, so "all" has to be reachable. */
  includeAll?: boolean;
  onSelectAll?: () => void;
}

/** The "All days" tile. Mirrors DateTile's three-row rhythm (strip / figure /
 *  unit) so it sits in the rail as a peer rather than a bolted-on control. */
const AllDaysTile = ({
  count,
  active,
  onClick,
}: {
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <div className="flex w-16 flex-col items-center gap-1.5">
    <button
      type="button"
      onClick={onClick}
      className="group/date-tile cursor-pointer rounded-xl transition-transform active:scale-[0.95]"
    >
      <Card className="w-16 gap-0 py-0 text-center">
        <div
          className={cn(
            "py-1 text-2xs font-semibold uppercase tracking-widest transition-colors group-hover/date-tile:bg-primary/30",
            active
              ? "bg-primary/90! text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          All
        </div>
        <div className="py-2">
          <div className="font-display text-2xl font-bold leading-none text-foreground">
            {count}
          </div>
          <div className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
            Days
          </div>
        </div>
      </Card>
    </button>
    <div className="line-clamp-2 w-16 text-center text-xs text-muted-foreground">
      All days
    </div>
  </div>
);

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
  includeAll = false,
  onSelectAll,
}: DayTabsProps = {}) => {
  const global = useActiveEventDay();
  const controlled = daysProp !== undefined;
  const days = daysProp ?? global.days;
  const activeDayId = controlled ? activeProp ?? null : global.activeDayId;
  const setActiveDay = controlled
    ? onSelect ?? (() => {})
    : global.setActiveDay;
  // Slide index to scroll to. The "All days" tile occupies slot 0, so every day
  // sits one slot right; a not-found day (-1, which is what "All" selected looks
  // like) lands cleanly on slot 0 via rawIndex + 1. Same +1 the animation stagger
  // uses below. Uncontrolled rails have no All tile, so no offset.
  const rawIndex = controlled
    ? days.findIndex((d) => d.id === activeDayId)
    : global.activeIndex;
  const emblaIndex = includeAll ? rawIndex + 1 : Math.max(0, rawIndex);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Center the active tile rather than pin it left, so it's always framed with
  // context on both sides; Embla still clamps the first/last snaps to the edges,
  // so early/late days settle flush rather than leaving dead space.
  const { emblaRef, emblaApi } = useEmblaCarouselApi("center", emblaIndex);
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(emblaIndex);
  }, [emblaApi, emblaIndex]);

  if (days.length <= 1) return null;

  return (
    <div className="mb-6">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            <AnimatePresence>
              {/* Inside the same AnimatePresence and carrying the same variants
                  as the day tiles — it leads the stagger (custom 0), so the rail
                  animates in as one row rather than one static tile beside a
                  cascade. Days shift to custom idx+1 to keep the order. */}
              {includeAll && (
                <motion.div
                  key="all-days"
                  custom={0}
                  variants={itemFadeUp}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  layout
                >
                  <AllDaysTile
                    count={days.length}
                    active={activeDayId === null}
                    onClick={() => onSelectAll?.()}
                  />
                </motion.div>
              )}
              {days.map((day, idx) => {
                const isActive = day.id === activeDayId;
                const isToday = day.date === todayStr;
                return (
                  <motion.div
                    key={day.id}
                    custom={includeAll ? idx + 1 : idx}
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
