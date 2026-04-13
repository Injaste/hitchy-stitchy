import { type FC } from "react";
import { motion } from "framer-motion";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";
import {
  calculateTimeDuration,
  formatTime,
  formatTimeRange,
} from "@/lib/utils/utils-time";
import { getLatestTime } from "../utils";

import type { TimelineGroupedDay, TimelineLabelGroup } from "../types";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";

import TimelineItemCard from "./TimelineItemCard";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const LabelCarousel: FC<{
  group: TimelineLabelGroup;
  isNotLastItem: boolean;
}> = ({ group, isNotLastItem }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  const groupStart = group.items[0]?.time_start ?? "";
  const groupEnd = getLatestTime(group.items);
  const timeRange = groupStart
    ? groupStart !== groupEnd
      ? formatTimeRange(groupStart, groupEnd)
      : formatTime(groupStart)
    : null;

  return (
    <div className={cn("relative flex gap-4", isNotLastItem && "pb-10")}>
      <div className="absolute top-0 bottom-0 left-[9px] border border-foreground/50 rounded-full" />
      <Circle className="size-5 text-primary/70 bg-background z-1" />

      <div className="space-y-2">
        <p className="text-sm">
          {group.label && (
            <>
              <span className="font-semibold text-foreground">
                {group.label}
              </span>
              {timeRange && (
                <span className="text-muted-foreground"> · {timeRange}</span>
              )}
            </>
          )}
          {!group.label && timeRange && (
            <span className="text-muted-foreground">{timeRange}</span>
          )}
        </p>

        <div className="-mx-1">
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden p-1">
              <motion.div variants={container} className="flex gap-3">
                {group.items.map((item) => (
                  <motion.div
                    variants={itemFadeUp}
                    key={item.id}
                    className="shrink-0 w-72 self-stretch"
                  >
                    <TimelineItemCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
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
        </div>
      </div>
    </div>
  );
};

const DayContent: FC<{ day: TimelineGroupedDay }> = ({ day }) => {
  const allItems = day.labelGroups.flatMap((g) => g.items);
  const earliest = allItems[0]?.time_start ?? "";
  const latest = getLatestTime(allItems);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1 font-medium">
        <h2 className="text-base">Day 1{`: ${"Event"}`}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground">{formatTime(earliest)}</span>
          <span>–</span>
          <span className=" text-foreground">{formatTime(latest)}</span>
          <span>·</span>
          <span>{calculateTimeDuration(earliest, latest)}</span>
        </div>
      </div>

      <motion.div variants={container}>
        {day.labelGroups.map((group, idx) => (
          <motion.div key={`timeline-label-${idx}`} variants={itemFadeUp}>
            <LabelCarousel
              group={group}
              isNotLastItem={idx < day.labelGroups.length - 1}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DayContent;
