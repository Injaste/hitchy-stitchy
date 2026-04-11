import { supabase } from "@/lib/supabase"
import type {
  TimelineItem,
  TimelineGroupedDay,
  CreateTimelineItemPayload,
  UpdateTimelineItemPayload,
} from "./types"

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  return arr.reduce((map, item) => {
    const k = key(item)
    const group = map.get(k) ?? []
    group.push(item)
    map.set(k, group)
    return map
  }, new Map<string, T[]>())
}

function mapRow(row: any): TimelineItem {
  return {
    id: row.id,
    eventId: row.event_id,
    day: row.day,
    label: row.label ?? null,
    timeStart: row.time_start,
    timeEnd: row.time_end ?? null,
    title: row.title,
    description: row.description ?? null,
    notes: row.notes ?? null,
    assignees: row.assignees ?? [],
    createdAt: row.created_at,
  }
}

export async function fetchTimeline(eventId: string): Promise<TimelineGroupedDay[]> {
  const { data, error } = await supabase
    .from("event_timelines")
    .select("id, event_id, day, label, time_start, time_end, title, description, notes, assignees, created_at")
    .eq("event_id", eventId)
    .order("day", { ascending: true })
    .order("time_start", { ascending: true })

  if (error) throw new Error(error.message)
  if (!data?.length) return []

  return groupTimeline(data.map(mapRow))
}

export async function createTimelineItem(payload: CreateTimelineItemPayload): Promise<TimelineItem> {
  const { data, error } = await supabase.rpc("create_timeline_item", {
    p_event_id: payload.eventId,
    p_day: payload.day,
    p_label: payload.label,
    p_time_start: payload.timeStart,
    p_time_end: payload.timeEnd,
    p_title: payload.title,
    p_description: payload.description,
    p_notes: payload.notes,
    p_assignees: payload.assignees,
  })
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updateTimelineItem(payload: UpdateTimelineItemPayload): Promise<void> {
  const { error } = await supabase
    .from("event_timelines")
    .update({
      label: payload.label,
      day: payload.day,
      time_start: payload.timeStart,
      time_end: payload.timeEnd,
      title: payload.title,
      description: payload.description,
      notes: payload.notes,
      assignees: payload.assignees,
    })
    .eq("id", payload.id)
  if (error) throw new Error(error.message)
}

export async function deleteTimelineItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("event_timelines")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)
}

function groupTimeline(items: TimelineItem[]): TimelineGroupedDay[] {
  const byDay = groupBy(items, (i) => i.day)

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayItems]) => {
      const labelled = dayItems.filter((i) => i.label)
      const unlabelled = dayItems.filter((i) => !i.label)

      const labelMap = groupBy(labelled, (i) => i.label!)
      const labelGroups = [...labelMap.entries()].map(([label, groupItems]) => ({
        label,
        earliestTime: groupItems.map((i) => i.timeStart).sort()[0],
        items: groupItems.sort((a, b) =>
          a.timeStart.localeCompare(b.timeStart) || a.createdAt.localeCompare(b.createdAt)
        ),
      }))

      const unlabelledGroups = unlabelled.map((i) => ({
        label: null as null,
        earliestTime: i.timeStart,
        items: [i],
      }))

      const labelGroupsSorted = [...labelGroups, ...unlabelledGroups]
        .sort((a, b) => a.earliestTime.localeCompare(b.earliestTime))
        .map(({ label, items }) => ({ label, items }))

      return { day, labelGroups: labelGroupsSorted }
    })
}