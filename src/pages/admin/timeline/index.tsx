import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { cn } from "@/lib/utils";

import { useTimelineQuery } from "./queries";

import TimelineSkeleton from "./states/TimelineSkeleton";

import type { TimelineGroupedDay } from "./types";
import TimelineEmpty from "./states/TimelineEmpty";
import { useAccess } from "../hooks/useAccess";

function DayContent({ day }: { day: TimelineGroupedDay }) {
  return "DayContent";

  return (
    <div className="space-y-6">
      {day.slots.map((slot) => (
        <>{slot.timeStart}</>
        // <TimelineSlot key={slot.timeStart} slot={slot} />
      ))}
    </div>
  );
}

function DayTabs({
  days,
  activeDayId,
  onSelect,
}: {
  days: TimelineGroupedDay[];
  activeDayId: string;
  onSelect: (id: string) => void;
}) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "keepSnaps",
  });

  return "DayTabs";

  return (
    <div ref={emblaRef} className="overflow-hidden mb-6">
      <div className="flex gap-2">
        {days.map((d) => {
          const date = (() => {
            const [y, m, day] = d.day.split("-").map(Number);
            return new Date(y, m - 1, day);
          })();
          const active = d.dayId === activeDayId;
          return (
            <button
              key={d.dayId}
              onClick={() => onSelect(d.dayId)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted/60",
              )}
            >
              {format(date, "d MMM")}
              <span className="ml-1.5 text-[11px] opacity-70">
                {format(date, "EEE")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const Timeline = () => {
  const { data, isLoading } = useTimelineQuery();
  const { canCreate } = useAccess();
  console.log(canCreate("timeline"));

  const days = data ?? [];
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const activeDay =
    days.find((d) => d.dayId === activeDayId) ?? days[0] ?? null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Timeline
        </h1>
        {canCreate("timeline") && (
          <Button
            size="sm"
            // onClick={() => openTimelineModal()}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add item
          </Button>
        )}
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <TimelineSkeleton />
          </ComponentFade>
        ) : !days.length ? (
          <ComponentFade key="empty">
            {/* <TimelineEmpty onAdd={() => openTimelineModal()} /> */}
            <TimelineEmpty onAdd={() => {}} />
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <DayTabs
              days={days}
              activeDayId={activeDay?.dayId ?? ""}
              onSelect={setActiveDayId}
            />
            <AnimatePresence mode="wait">
              {activeDay && (
                <ComponentFade key={activeDay.dayId}>
                  <DayContent day={activeDay} />
                </ComponentFade>
              )}
            </AnimatePresence>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timeline;
