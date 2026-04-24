import { type FC } from "react";
import { motion } from "framer-motion";

import { container, itemFadeIn, itemFadeUp } from "@/lib/animations";
import { calculateTimeDuration, formatTime } from "@/lib/utils/utils-time";
import { getLatestTime } from "../utils";

import type { TimelineGroupedDay, TimelineLabelGroup } from "../types";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";

import TimelineCard from "./TimelineCard";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import ArraySeparator from "@/components/custom/array-separator";

interface LabelCarouselProps {
  group: TimelineLabelGroup;
  isNotLastItem: boolean;
}

const LabelCarousel: FC<LabelCarouselProps> = ({ group, isNotLastItem }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  return (
    <div className={cn("relative flex gap-4", isNotLastItem && "pb-10")}>
      <div className="absolute top-0 bottom-0 left-[9px] border border-foreground/50 rounded-full" />
      <Circle className="size-5 text-primary/70 bg-background z-1 shrink-0" />

      <div className="space-y-2 min-w-0 flex-1">
        {group.label && (
          <p className="text-sm">
            <span className="font-semibold text-foreground">{group.label}</span>
          </p>
        )}

        <div className={cn("-mx-1", !group.label && "-my-1.5")}>
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden p-1">
              <motion.div variants={container} className="flex gap-3">
                {group.items.map((item) => (
                  <motion.div
                    variants={itemFadeUp}
                    key={item.id}
                    className="shrink-0 w-72 self-stretch"
                  >
                    <TimelineCard item={item} />
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

interface DayContentProps {
  day: TimelineGroupedDay;
  dayIndex: number;
}

const DayContent: FC<DayContentProps> = ({ day, dayIndex }) => {
  const allItems = day.labelGroups.flatMap((g) => g.items);
  const earliest = allItems[0]?.time_start ?? "";
  const latest = getLatestTime(allItems);

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
