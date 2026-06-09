import { type FC } from "react";
import { Box, Layers, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { container, itemFadeUp } from "@/lib/animations";
import { formatTime } from "@/lib/utils/utils-time";
import { Button } from "@/components/ui/button";
import ArraySeparator from "@/components/custom/array-separator";

import { getEarliestTime, getLatestTime, segmentItems } from "../utils";
import type { Timeline, TimelineGroupedSegment } from "../types";
import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineModalStore";
import { useSegmentCollapse } from "../hooks/useSegmentCollapse";
import SegmentLabel from "./SegmentLabel";

interface DaySegmentProps {
  segment: TimelineGroupedSegment;
  dayItems: Timeline[];
  /** False only for a day's single unnamed segment (renders flat, like before). */
  showHeading: boolean;
}

/** One segment in the day flow: a light chapter heading + its label rail. */
const DaySegment: FC<DaySegmentProps> = ({ segment, dayItems, showHeading }) => {
  const { canCreate } = useAccess();
  const openCreate = useTimelineModalStore((s) => s.openCreate);
  const collapsed = useSegmentCollapse((s) => !!s.collapsed[segment.id]);
  const toggleCollapse = useSegmentCollapse((s) => s.toggle);

  const items = segmentItems(segment);
  const earliest = items.length ? getEarliestTime(items) : "";
  const latest = getLatestTime(items);
  const suggested = (items.length && (latest || earliest)) || null;

  return (
    <div className="space-y-3 group/day-segment">
      {showHeading && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCollapse(segment.id)}
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? `Expand ${segment.name ?? "schedule"}`
                : `Collapse ${segment.name ?? "schedule"}`
            }
            className="shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {collapsed ? (
              <Box className="size-3.5" />
            ) : (
              <Layers className="size-3.5" />
            )}
          </button>
          <span className="font-display text-sm font-semibold text-foreground truncate">
            {segment.name ?? "Schedule"}
          </span>
          {earliest && latest && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-2xs text-muted-foreground">
              <ArraySeparator
                items={[formatTime(earliest), formatTime(latest)]}
                separator="-"
                className="gap-1"
              />
            </span>
          )}
          {canCreate("timeline") && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="transition-opacity md:opacity-0 md:group-hover/day-segment:opacity-100"
              onClick={() =>
                openCreate(
                  segment.id,
                  null,
                  suggested,
                  segment.name ? `Add to ${segment.name}` : null,
                )
              }
              aria-label={`Add item to ${segment.name ?? "schedule"}`}
            >
              <Plus className="size-4" />
            </Button>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="segment-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {items.length ? (
              <motion.div variants={container} initial="hidden" animate="show">
                <AnimatePresence>
                  {segment.labelGroups.map((group, idx) => (
                    <motion.div
                      key={group.label ?? `_unlabelled-${group.items[0].id}`}
                      variants={itemFadeUp}
                      exit="hidden"
                      layout
                    >
                      <SegmentLabel
                        group={group}
                        segmentId={segment.id}
                        isNotLastItem={idx < segment.labelGroups.length - 1}
                        dayItems={dayItems}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <p className="py-1 text-sm italic text-muted-foreground">
                No items yet — add the first to set the time.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DaySegment;
