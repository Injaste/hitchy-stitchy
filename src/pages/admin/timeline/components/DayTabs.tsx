import { type FC } from "react";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/utils/utils-time";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { itemFadeIn } from "@/lib/animations";

import type { TimelineGroupedDay } from "../types";
import { useEmblaCarouselApi } from "../../hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "../../hooks/embla/useEmblaEdgeDetection";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DayTabsProps {
  days: TimelineGroupedDay[];
  activeDayId: string;
  onSelect: (id: string) => void;
}

const DayTabs: FC<DayTabsProps> = ({ days, activeDayId, onSelect }) => {
  const { emblaRef, emblaApi } = useEmblaCarouselApi();
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  return (
    <div className="mb-6 -mx-1">
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-2">
            {days.map((d, idx) => {
              const date = parseLocalDate(d.day);
              const active = d.day === activeDayId;
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5">
                  <Button
                    onClick={() => onSelect(d.day)}
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "flex flex-col h-auto! py-3 px-6",
                      active && "shadow-sm",
                    )}
                  >
                    <span className="text-sm">{format(date, "d MMM")}</span>
                    <span className="text-2xs opacity-70">
                      {format(date, "EEE")}
                    </span>
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Day {idx + 1}
                  </span>
                </div>
              );
            })}
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
