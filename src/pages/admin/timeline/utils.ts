import { addDays } from "date-fns";

import { parseLocalDate } from "@/lib/utils/utils-time";
import type { TimelineItem, TimelineGroupedDay } from "./types";

export function getEarliestTime(items: TimelineItem[]): string {
  return items.reduce((acc, item) => (item.timeStart < acc ? item.timeStart : acc), items[0]?.timeStart ?? "");
}

export function getLatestTime(items: TimelineItem[]): string {
  return items.reduce((acc, item) => {
    const t = item.timeEnd ?? item.timeStart;
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

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  return arr.reduce((map, item) => {
    const k = key(item);
    const group = map.get(k) ?? [];
    group.push(item);
    map.set(k, group);
    return map;
  }, new Map<string, T[]>());
}

export function groupTimeline(items: TimelineItem[]): TimelineGroupedDay[] {
  const byDay = groupBy(items, (i) => i.day);

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayItems]) => {
      const labelled = dayItems.filter((i) => i.label);
      const unlabelled = dayItems.filter((i) => !i.label);

      const labelMap = groupBy(labelled, (i) => i.label!);
      const labelGroups = [...labelMap.entries()].map(([label, groupItems]) => ({
        label,
        earliestTime: groupItems.map((i) => i.timeStart).sort()[0],
        items: groupItems.sort(
          (a, b) => a.timeStart.localeCompare(b.timeStart) || a.createdAt.localeCompare(b.createdAt),
        ),
      }));

      const unlabelledGroups = unlabelled.map((i) => ({
        label: null as null,
        earliestTime: i.timeStart,
        items: [i],
      }));

      const labelGroupsSorted = [...labelGroups, ...unlabelledGroups]
        .sort((a, b) => a.earliestTime.localeCompare(b.earliestTime))
        .map(({ label, items }) => ({ label, items }));

      return { day, labelGroups: labelGroupsSorted };
    });
}
