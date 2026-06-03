import { addDays, differenceInMinutes } from "date-fns";

import { parseLocalDate } from "@/lib/utils/utils-time";
import type { Timeline, TimelineGrouped, TimelineGroupedDay } from "./types";

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

export function generateEventDays(dateStart: string, dateEnd: string): Date[] {
  const start = parseLocalDate(dateStart);
  const end = parseLocalDate(dateEnd);
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

interface LabelBucket {
  label: string | null;
  earliest: string;
  items: Timeline[];
}

export function groupTimeline(items: Timeline[]): TimelineGrouped {
  const byDay = new Map<string, Map<string, LabelBucket>>();
  const labelSet = new Set<string>();

  for (const item of items) {
    let dayMap = byDay.get(item.day);
    if (!dayMap) {
      dayMap = new Map();
      byDay.set(item.day, dayMap);
    }

    // Leading space ensures unlabelled items sort after labelled ones in the Map.
    const key = item.label ?? ` ${item.id}`;
    if (item.label) labelSet.add(item.label);

    const bucket = dayMap.get(key);
    if (!bucket) {
      dayMap.set(key, {
        label: item.label,
        earliest: item.time_start,
        items: [item],
      });
    } else {
      bucket.items.push(item);
      if (item.time_start < bucket.earliest) bucket.earliest = item.time_start;
    }
  }

  const days: TimelineGroupedDay[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayMap]) => {
      const labelGroups = [...dayMap.values()]
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
      return { day, labelGroups };
    });

  return {
    days,
    labels: [...labelSet].sort((a, b) => a.localeCompare(b)),
  };
}
