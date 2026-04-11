import { type FC } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { itemFadeIn } from "@/lib/animations";

import type { TimelineGroupedDay } from "../types";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { Button } from "@/components/ui/button";

interface DayTabsProps {
  days: TimelineGroupedDay[];
  activeDayId: string;
  onSelect: (id: string) => void;
}

const DayTabs: FC<DayTabsProps> = ({ days, activeDayId, onSelect }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi({});
  const { isAtStart, isAtEnd } = useEmblaEdgeDetection(emblaApi);

  return (
    <div className="mb-6 -mx-1">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            {days.map((d, idx) => {
              const [y, mo, dy] = d.day.split("-").map(Number);
              const date = new Date(y, mo - 1, dy);
              const active = d.day === activeDayId;
              return (
                <div key={d.day} className="flex flex-col gap-2 text-center">
                  <Button
                    onClick={() => onSelect(d.day)}
                    variant={active ? "default" : "outline"}
                    className="flex flex-col h-auto! py-2 px-4"
                  >
                    {format(date, "d MMM")}
                    <span className="text-2xs opacity-70">
                      {format(date, "EEE")}
                    </span>
                  </Button>

                  <span className="text-xs">Day {idx + 1}</span>
                </div>
              );
            })}
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
  );
};

export default DayTabs;
