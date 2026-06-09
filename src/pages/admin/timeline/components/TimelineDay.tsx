import { useState, type FC } from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { calculateTimeDuration, formatTime } from "@/lib/utils/utils-time";
import { Button } from "@/components/ui/button";
import ArraySeparator from "@/components/custom/array-separator";

import { dayItems, getEarliestTime, getLatestTime } from "../utils";
import type { TimelineGroupedDay } from "../types";
import { useAccess } from "../../hooks/useAccess";

import DaySegment from "./DaySegment";
import SegmentsSheet from "./SegmentsSheet";

interface TimelineDayProps {
  day: TimelineGroupedDay;
}

/**
 * One day's body. A day with only its default (unnamed) segment renders flat
 * (the original look); named segments render as light chapter headings. The
 * "Segments" button opens the management sheet (add / rename / delete / reorder).
 */
const TimelineDay: FC<TimelineDayProps> = ({ day }) => {
  const { canCreate } = useAccess();
  const [sheetOpen, setSheetOpen] = useState(false);

  const items = dayItems(day);
  const earliest = items.length ? getEarliestTime(items) : "";
  const latest = getLatestTime(items);

  const onlyDefault =
    day.segments.length === 1 && day.segments[0].name === null;

  // Show every named segment (even empty) + the default only if it holds items.
  const visibleSegments = day.segments.filter(
    (s) => s.name !== null || s.labelGroups.length > 0,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-foreground">
            {day.segments.length}{" "}
            {day.segments.length === 1 ? "Segment" : "Segments"}
          </span>
          {earliest && latest && (
            <>
              {/* Bigger lead dot sets the segment count apart from the times;
                  smaller dots separate start · end · duration within them. */}
              <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              <ArraySeparator
                items={[
                  <span className="text-foreground">{formatTime(earliest)}</span>,
                  <span className="text-foreground">{formatTime(latest)}</span>,
                  calculateTimeDuration(earliest, latest, "long"),
                ]}
                separator={
                  <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                }
              />
            </>
          )}
        </div>
        {canCreate("timeline") && (
          <Button
            variant="outline"
            size="xs"
            className="gap-1.5"
            onClick={() => setSheetOpen(true)}
          >
            <GalleryVerticalEnd className="size-3.5" /> Segments
          </Button>
        )}
      </div>

      {onlyDefault ? (
        <DaySegment segment={day.segments[0]} dayItems={items} showHeading={false} />
      ) : (
        <div className="space-y-5">
          {visibleSegments.map((segment) => (
            <DaySegment
              key={segment.id}
              segment={segment}
              dayItems={items}
              showHeading
            />
          ))}
        </div>
      )}

      <SegmentsSheet day={day} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

export default TimelineDay;
