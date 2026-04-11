import { type FC } from "react";
import { motion } from "framer-motion";

import { itemFadeIn } from "@/lib/animations";
import { calculateTimeDuration, formatTime } from "@/lib/utils/utils-time";

import type { TimelineGroupedDay, TimelineLabelGroup } from "../types";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";

import TimelineItemCard from "./TimelineItemCard";

const LabelCarousel: FC<{ group: TimelineLabelGroup }> = ({ group }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi({});
  const { isAtStart, isAtEnd } = useEmblaEdgeDetection(emblaApi);

  const groupStart = group.items[0]?.timeStart ?? "";
  const groupEnd = group.items.reduce((acc, item) => {
    const t = item.timeEnd ?? item.timeStart;
    return t > acc ? t : acc;
  }, "");
  const itemCount = group.items.length;
  const countLabel = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  const timeRange =
    groupStart && groupEnd && groupStart !== groupEnd
      ? `${formatTime(groupStart)} – ${formatTime(groupEnd)}`
      : groupStart
        ? formatTime(groupStart)
        : null;

  return (
    <div className="space-y-3">
      <div>
        {group.label ? (
          <p className="text-sm">
            <span className="font-serif font-semibold text-foreground">
              {group.label}
            </span>
            <span className="text-muted-foreground">
              {" · "}
              {countLabel}
              {timeRange && ` · ${timeRange}`}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {countLabel}
            {timeRange && ` · ${timeRange}`}
          </p>
        )}
      </div>

      <div className="-mx-1">
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden p-1">
            <div className="flex gap-3">
              {group.items.map((item) => (
                <div key={item.id} className="shrink-0 w-72">
                  <TimelineItemCard item={item} roleMap={{}} />
                </div>
              ))}
            </div>
          </div>

          {/* Left fade — only when scrolled */}
          {isAtStart && (
            <motion.div
              variants={itemFadeIn}
              className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent"
            />
          )}

          {/* Right fade — only when more content */}
          {isAtEnd && (
            <motion.div
              variants={itemFadeIn}
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const DayContent: FC<{ day: TimelineGroupedDay }> = ({ day }) => {
  const allItems = day.labelGroups.flatMap((g) => g.items);
  const earliest = allItems[0]?.timeStart ?? "";
  const latest = allItems.reduce((acc, item) => {
    const t = item.timeEnd ?? item.timeStart;
    return t > acc ? t : acc;
  }, "");

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-mono font-medium text-foreground">
          {formatTime(earliest)}
        </span>
        <span>–</span>
        <span className="font-mono font-medium text-foreground">
          {formatTime(latest)}
        </span>
        <span>·</span>
        <span>{calculateTimeDuration(earliest, latest)}</span>
      </div>

      {day.labelGroups.map((group, i) => (
        <LabelCarousel key={group.label ?? `__none__${i}`} group={group} />
      ))}
    </div>
  );
};

export default DayContent;
