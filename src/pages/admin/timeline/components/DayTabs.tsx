import { type FC, useEffect } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { itemFadeIn, itemFadeUp } from "@/lib/animations";

import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useActiveTimelineQuery } from "../queries";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import type { TimelineGroupedDay } from "../types";
import DateTile from "./DateTile";

interface DayTabsProps {
  days: TimelineGroupedDay[];
  activeDate: string;
  onSelect: (date: string) => void;
}

const DayTabs: FC<DayTabsProps> = ({ days, activeDate, onSelect }) => {
  const { data: active } = useActiveTimelineQuery();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const dates = days.map((d) => d.date);
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
              {days.map((day, idx) => {
                const isActive = day.date === activeDate;
                const isToday = day.date === todayStr;
                return (
                  <motion.div
                    key={day.date}
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
                      onClick={() => onSelect(day.date)}
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
