import { type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";
import { calculateTimeDuration, formatTime } from "@/lib/utils/utils-time";
import { getLatestTime } from "../utils";

import type { TimelineGroupedDay, TimelineLabelGroup } from "../types";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";

import TimelineCard from "./TimelineCard";
import { Circle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ArraySeparator from "@/components/custom/array-separator";
import { Button } from "@/components/ui/button";
import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";

interface LabelCarouselProps {
  group: TimelineLabelGroup;
  isNotLastItem: boolean;
}

const LabelCarousel: FC<LabelCarouselProps> = ({ group, isNotLastItem }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);
  const { canCreate } = useAccess();
  const openCreateWithLabel = useTimelineModalStore(
    (s) => s.openCreateWithLabel,
  );

  return (
    <div className={cn("group/timeline-section relative flex gap-4", isNotLastItem && "pb-10")}>
      <div className="absolute top-0 bottom-0 left-[9px] border border-foreground/50 rounded-full" />
      <Circle className="size-5 text-primary/70 bg-background z-1 shrink-0" />

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 ml-1 -mt-[3px]">
          {group.label && (
            <p className="text-sm">
              <span className="font-semibold text-foreground">
                {group.label}
              </span>
            </p>
          )}
          {canCreate("timeline") && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="opacity-50 lg:opacity-0 group-hover/timeline-section:opacity-50 hover:opacity-100 transition-opacity"
              onClick={() => openCreateWithLabel(group.label)}
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
              <motion.div variants={container} className="flex gap-3">
                <AnimatePresence>
                  {group.items.map((item) => (
                    <motion.div
                      variants={itemFadeUp}
                      exit="hidden"
                      layout
                      key={item.id}
                      className="shrink-0 w-72 self-stretch"
                    >
                      <TimelineCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
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

const AddSectionSlot: FC = () => {
  const openCreateWithLabel = useTimelineModalStore(
    (s) => s.openCreateWithLabel,
  );

  return (
    <div className="relative flex gap-4 w-fit">
      <Circle className="size-5 text-muted-foreground/40 bg-background z-1 shrink-0" />
      <div className="min-w-0 flex-1 -mt-2">
        <Button
          variant="empty"
          onClick={() => openCreateWithLabel(null)}
          className="group flex w-full items-center gap-2 rounded-md border border-dashed border-foreground/20 px-4 py-3 text-sm text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
        >
          <Plus className="size-4" />
          <span>Add new section</span>
        </Button>
      </div>
    </div>
  );
};

interface DayContentProps {
  day: TimelineGroupedDay;
  dayIndex: number;
}

const DayContent: FC<DayContentProps> = ({ day, dayIndex }) => {
  const { canCreate } = useAccess();
  const allItems = day.labelGroups.flatMap((g) => g.items);
  const earliest = allItems[0]?.time_start ?? "";
  const latest = getLatestTime(allItems);
  const showAddSlot = canCreate("timeline");

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1 font-medium">
        <h2>Day {dayIndex + 1}</h2>
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
              // Stable key: labeled groups are unique per day; unlabelled
              // groups always contain exactly one item, so its id is unique.
              key={group.label ?? `_unlabelled-${group.items[0].id}`}
              variants={itemFadeUp}
              exit="hidden"
              layout
            >
              <LabelCarousel
                group={group}
                // Extend the connector line when the add-section slot will
                // render below, so the timeline visually continues into it.
                isNotLastItem={idx < day.labelGroups.length - 1 || showAddSlot}
              />
            </motion.div>
          ))}
          {showAddSlot && (
            <motion.div
              key="_add-section-slot"
              variants={itemFadeUp}
              exit="hidden"
              layout
            >
              <AddSectionSlot />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DayContent;
