import { type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { container, itemFadeUp } from "@/lib/animations";
import { calculateTimeDuration, formatTime } from "@/lib/utils/utils-time";
import { getLatestTime } from "../utils";

import type {
  Timeline,
  TimelineGroupedDay,
  TimelineLabelGroup,
} from "../types";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";

import TimelineCard from "./TimelineCard";
import { Circle, CircleCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ArraySeparator from "@/components/custom/array-separator";
import { Button } from "@/components/ui/button";
import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useActiveTimelineQuery } from "../queries";

interface LabelCarouselProps {
  group: TimelineLabelGroup;
  isNotLastItem: boolean;
  dayItems: Timeline[];
}

const LabelCarousel: FC<LabelCarouselProps> = ({
  group,
  isNotLastItem,
  dayItems,
}) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);
  const { canCreate } = useAccess();
  const openCreateWithLabel = useTimelineModalStore(
    (s) => s.openCreateWithLabel,
  );
  const { data: active } = useActiveTimelineQuery();

  const isActive = group.items.some((i) => i.id === active?.id);
  const isDone = !isActive && group.items.every((i) => i.started_at !== null);

  // Prefill the next item's start with the last item's end (or start) time.
  const lastItem = group.items[group.items.length - 1];
  const suggestedTime = lastItem.time_end ?? lastItem.time_start;

  return (
    <div
      className={cn(
        "group/timeline-section relative flex gap-4",
        isNotLastItem && "pb-10",
      )}
    >
      <div className="absolute top-0 bottom-0 left-[9px] border border-foreground/50 rounded-full" />

      {isActive ? (
        <div className="relative size-5 shrink-0 z-1 flex items-center justify-center bg-background">
          <span className="animate-ping absolute h-3 w-3 rounded-full bg-primary/50" />
          <span className="relative h-3 w-3 rounded-full bg-primary" />
        </div>
      ) : isDone ? (
        <CircleCheck className="size-5 text-muted-foreground bg-background z-1 shrink-0" />
      ) : (
        <Circle className="size-5 text-primary/70 bg-background z-1 shrink-0" />
      )}

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 ml-1 -mt-[3px]">
          {group.label && (
            <p className="text-sm">
              <span
                className={cn(
                  "font-semibold transition-colors duration-500",
                  isActive && "text-primary",
                  isDone && "text-muted-foreground",
                  !isActive && !isDone && "text-foreground",
                )}
              >
                {group.label}
              </span>
            </p>
          )}
          {canCreate("timeline") && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="hidden transition-opacity lg:inline-flex lg:opacity-0 lg:group-hover/timeline-section:opacity-50 lg:hover:opacity-100"
              onClick={() => openCreateWithLabel(group.label, suggestedTime)}
              aria-label={
                group.label ? `Add item to ${group.label}` : "Add item"
              }
            >
              <Plus className="size-4" />
            </Button>
          )}
        </div>

        <div>
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden p-1">
              <div className="flex gap-3">
                <AnimatePresence>
                  {group.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      custom={i}
                      variants={itemFadeUp}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      layout
                      className="shrink-0 w-72 self-stretch"
                    >
                      <TimelineCard item={item} dayItems={dayItems} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent transition-opacity"
              style={{ opacity: showLeftFade ? 1 : 0 }}
            />

            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent transition-opacity"
              style={{ opacity: showRightFade ? 1 : 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineSectionProps {
  day: TimelineGroupedDay;
}

const TimelineSection: FC<TimelineSectionProps> = ({ day }) => {
  const allItems = day.labelGroups.flatMap((g) => g.items);
  const earliest = allItems[0]?.time_start ?? "";
  const latest = getLatestTime(allItems);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1 font-medium">
        <ArraySeparator
          items={[
            earliest && latest && (
              <ArraySeparator
                items={[formatTime(earliest), formatTime(latest)]}
                separator="-"
                className="text-foreground gap-1"
              />
            ),
            calculateTimeDuration(earliest, latest, "long"),
          ]}
          className="flex text-sm text-muted-foreground"
        />
      </div>

      <motion.div variants={container}>
        <AnimatePresence>
          {day.labelGroups.map((group, idx) => (
            <motion.div
              key={group.label ?? `_unlabelled-${group.items[0].id}`}
              variants={itemFadeUp}
              exit="hidden"
              layout
            >
              <LabelCarousel
                group={group}
                isNotLastItem={idx < day.labelGroups.length - 1}
                dayItems={allItems}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TimelineSection;
