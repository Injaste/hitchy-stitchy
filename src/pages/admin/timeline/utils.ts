import { differenceInMinutes } from "date-fns";

import { parseLocalDate } from "@/lib/utils/utils-time";
import type { EventDay } from "../days/types";
import type {
  Timeline,
  EventSegment,
  TimelineGrouped,
  TimelineGroupedDay,
  TimelineGroupedSegment,
  TimelineLabelGroup,
} from "./types";

export function scheduledStartDate(
  item: Pick<Timeline, "day" | "time_start">,
): Date {
  const [h, m] = item.time_start.split(":").map(Number);
  const d = parseLocalDate(item.day);
  d.setHours(h, m, 0, 0);
  return d;
}

export function scheduledEndDate(
  item: Pick<Timeline, "day" | "time_start" | "time_end">,
): Date | null {
  if (!item.time_end) return null;
  const [h, m] = item.time_end.split(":").map(Number);
  const d = parseLocalDate(item.day);
  d.setHours(h, m, 0, 0);
  return d;
}

export function startDelayMinutes(item: Timeline): number | null {
  if (!item.started_at) return null;
  const delta = differenceInMinutes(
    new Date(item.started_at),
    scheduledStartDate(item),
  );
  return delta > 0 ? delta : 0;
}

export type CardLifecycle = "start" | "end" | "done" | null;

export function getCardLifecycle(
  item: Timeline,
  dayItems: Timeline[],
  activeId: string | null,
  now: Date,
  bufferMin = 15,
): CardLifecycle {
  if (item.id === activeId) return "end";
  // need to check for end, because the above already checks for end
  if (item.started_at !== null) return "done";

  const sorted = [...dayItems].sort(
    (a, b) =>
      a.time_start.localeCompare(b.time_start) ||
      a.created_at.localeCompare(b.created_at),
  );
  const live = activeId
    ? (dayItems.find((i) => i.id === activeId) ?? null)
    : null;
  const nextUp =
    sorted.find(
      (i) =>
        i.started_at === null && (!live || i.time_start >= live.time_start),
    ) ?? null;

  const inWindow =
    scheduledStartDate(item).getTime() - bufferMin * 60_000 <= now.getTime();

  return item.id === nextUp?.id || inWindow ? "start" : null;
}

export function getEarliestTime(items: Timeline[]): string {
  return items.reduce(
    (acc, item) => (item.time_start < acc ? item.time_start : acc),
    items[0]?.time_start ?? "",
  );
}

export function getLatestTime(items: Timeline[]): string {
  return items.reduce((acc, item) => {
    const t = item.time_end ?? item.time_start;
    return t > acc ? t : acc;
  }, "");
}

// ── Grouped-tree accessors ──────────────────────────────────────────────────
// Small pure helpers so components don't re-implement the same flatMaps/lookups.

/** All items in a segment (flattened across its label groups). */
export function segmentItems(segment: TimelineGroupedSegment): Timeline[] {
  return segment.labelGroups.flatMap((g) => g.items);
}

/** All items in a day (flattened across its segments). */
export function dayItems(day: TimelineGroupedDay): Timeline[] {
  return day.segments.flatMap(segmentItems);
}

/** Whether a day holds any timeline item at all. */
export function dayHasItems(day: TimelineGroupedDay): boolean {
  return day.segments.some((s) => s.labelGroups.length > 0);
}

/**
 * Display name for a day: its label, else a positional "Day N" (1-based). The
 * canonical day name across every day-bounded feature — reuse rather than
 * re-deriving the fallback.
 */
export function dayLabel(label: string | null | undefined, index: number): string {
  return label?.trim() || `Day ${index + 1}`;
}

/** The default (unnamed) segment of a day — the fallback target for "add item". */
export function defaultSegmentId(
  day: TimelineGroupedDay | null | undefined,
): string | null {
  return (
    day?.segments.find((s) => s.name === null)?.id ??
    day?.segments[0]?.id ??
    null
  );
}

/** Find a segment by id across all days. */
export function findSegment(
  days: TimelineGroupedDay[],
  segmentId: string,
): TimelineGroupedSegment | undefined {
  return days.flatMap((d) => d.segments).find((s) => s.id === segmentId);
}

/** Build-time accumulator: a label group plus an `earliest` sort key (dropped from the result). */
interface LabelBucket extends TimelineLabelGroup {
  earliest: string;
}

/** Bucket a segment's items by label, ordered by their earliest start. */
function buildLabelGroups(items: Timeline[]): TimelineLabelGroup[] {
  const byLabel = new Map<string, LabelBucket>();

  for (const item of items) {
    // Leading space ensures unlabelled items sort after labelled ones in the Map.
    const key = item.label ?? ` ${item.id}`;
    const bucket = byLabel.get(key);
    if (!bucket) {
      byLabel.set(key, {
        label: item.label,
        earliest: item.time_start,
        items: [item],
      });
    } else {
      bucket.items.push(item);
      if (item.time_start < bucket.earliest) bucket.earliest = item.time_start;
    }
  }

  return [...byLabel.values()]
    .sort((a, b) => a.earliest.localeCompare(b.earliest))
    .map(({ label, items }) => ({
      label,
      items:
        items.length === 1
          ? items
          : items.sort(
              (a, b) =>
                a.time_start.localeCompare(b.time_start) ||
                a.created_at.localeCompare(b.created_at),
            ),
    }));
}

/**
 * Build the day → segment → label tree from the raw rows. Days and segments come
 * from event_days / event_segments (so empty ones still render and are addable);
 * items are slotted into their segment by segment_id, then grouped by label.
 */
export function groupTimeline(
  items: Timeline[],
  eventDays: EventDay[],
  eventSegments: EventSegment[],
): TimelineGrouped {
  const itemsBySegment = new Map<string, Timeline[]>();
  const labelSet = new Set<string>();

  for (const item of items) {
    if (item.label) labelSet.add(item.label);
    const arr = itemsBySegment.get(item.segment_id);
    if (arr) arr.push(item);
    else itemsBySegment.set(item.segment_id, [item]);
  }

  const segmentsByDay = new Map<string, EventSegment[]>();
  for (const s of eventSegments) {
    const arr = segmentsByDay.get(s.day_id);
    if (arr) arr.push(s);
    else segmentsByDay.set(s.day_id, [s]);
  }

  const days = [...eventDays]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      day_id: d.id,
      label: d.label,
      segments: (segmentsByDay.get(d.id) ?? [])
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order ||
            (a.name ?? "").localeCompare(b.name ?? ""),
        )
        .map((s) => ({
          id: s.id,
          name: s.name,
          sort_order: s.sort_order,
          labelGroups: buildLabelGroups(itemsBySegment.get(s.id) ?? []),
        })),
    }));

  return {
    days,
    labels: [...labelSet].sort((a, b) => a.localeCompare(b)),
    eventDays,
    eventSegments,
  };
}

/** Flatten the grouped tree back to a flat item list (for optimistic re-grouping). */
export function flattenTimeline(grouped: TimelineGrouped): Timeline[] {
  return grouped.days.flatMap(dayItems);
}
