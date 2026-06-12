import { useState, type FC } from "react";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  GalleryVerticalEnd,
} from "lucide-react";

import { calculateTimeDuration, formatTime } from "@/lib/utils/utils-time";
import { Button } from "@/components/ui/button";

import { dayItems, getEarliestTime, getLatestTime } from "../utils";
import type { TimelineGroupedDay } from "../types";
import { useAccess } from "../../hooks/useAccess";
import { useSegmentCollapse } from "../hooks/useSegmentCollapse";

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
  const collapsed = useSegmentCollapse((s) => s.collapsed);
  const collapseAll = useSegmentCollapse((s) => s.collapseAll);
  const expandAll = useSegmentCollapse((s) => s.expandAll);

  const items = dayItems(day);
  const earliest = items.length ? getEarliestTime(items) : "";
  const latest = getLatestTime(items);
  // Short ("30m") on mobile, long ("30 minutes") on desktop.
  const durationShort =
    earliest && latest ? calculateTimeDuration(earliest, latest, "short") : "";
  const durationLong =
    earliest && latest ? calculateTimeDuration(earliest, latest, "long") : "";

  const onlyDefault =
    day.segments.length === 1 && day.segments[0].name === null;

  // Show every named segment (even empty) + the default only if it holds items.
  const visibleSegments = day.segments.filter(
    (s) => s.name !== null || s.labelGroups.length > 0,
  );

  // Collapse-all only applies to segments that render a heading (not the flat
  // single-default day). Toggle direction follows whether they're all collapsed.
  const headedIds = onlyDefault ? [] : visibleSegments.map((s) => s.id);
  const showCollapseToggle = headedIds.length > 1;
  const allCollapsed =
    showCollapseToggle && headedIds.every((id) => collapsed[id]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-2">
        <div className="flex items-start gap-2 text-sm font-medium text-muted-foreground sm:items-center">
          {showCollapseToggle && (
            <button
              type="button"
              onClick={() =>
                allCollapsed ? expandAll(headedIds) : collapseAll(headedIds)
              }
              aria-label={
                allCollapsed ? "Expand all segments" : "Collapse all segments"
              }
              className="shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {allCollapsed ? (
                <ChevronsUpDown className="size-3.5" />
              ) : (
                <ChevronsDownUp className="size-3.5" />
              )}
            </button>
          )}
          {/* Count + times share a column so the times wrap under the label
              (not the chevron) on mobile, and sit inline on desktop. */}
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-foreground">
              {day.segments.length}{" "}
              {day.segments.length === 1 ? "Segment" : "Segments"}
            </span>
            {earliest && latest && (
              <div className="flex items-center gap-1.5">
                {/* Separator hierarchy, matching the rest of the timeline:
                    · bigger dot   → the significant split (segments ↔ schedule)
                    · dash         → binds the time range (as the DaySegment chip)
                    · smaller dot  → sets the related duration apart
                    The lead dot is inline on desktop only; on mobile the times
                    own their line below the count, so it would dangle. */}
                <span className="hidden size-1.5 shrink-0 rounded-full bg-muted-foreground/60 sm:block" />
                <span className="text-foreground">
                  {formatTime(earliest)} - {formatTime(latest)}
                </span>
                {durationLong && (
                  <>
                    <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span>
                      <span className="sm:hidden">{durationShort}</span>
                      <span className="hidden sm:inline">{durationLong}</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
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
        <DaySegment
          segment={day.segments[0]}
          dayItems={items}
          showHeading={false}
        />
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
