import { supabase } from "@/lib/supabase"
import type {
  TimelineItem,
  TimelineGroupedDay,
  CreateTimelineItemPayload,
  UpdateTimelineItemPayload,
} from "./types"
import { groupTimeline } from "./utils"

export async function fetchTimeline(eventId: string): Promise<TimelineGroupedDay[]> {
  const { data, error } = await supabase
    .from("event_timelines")
    .select("id, event_id, day, label, time_start, time_end, title, description, notes, assignees, created_at")
    .eq("event_id", eventId)
    .order("day", { ascending: true })
    .order("time_start", { ascending: true })

  if (error) throw new Error(error.message)
  if (!data?.length) return []

  return groupTimeline(data as TimelineItem[])
}

export async function createTimelineItem(payload: CreateTimelineItemPayload): Promise<TimelineItem> {
  const { data, error } = await supabase.rpc("create_timeline_item", {
    p_event_id: payload.event_id,
    p_day: payload.day,
    p_label: payload.label,
    p_time_start: payload.time_start,
    p_time_end: payload.time_end,
    p_title: payload.title,
    p_description: payload.description,
    p_notes: payload.notes,
    p_assignees: payload.assignees,
  })
  if (error) throw new Error(error.message)
  return data as TimelineItem
}

export async function updateTimelineItem(payload: UpdateTimelineItemPayload): Promise<void> {
  const { error } = await supabase
    .from("event_timelines")
    .update({
      label: payload.label,
      day: payload.day,
      time_start: payload.time_start,
      time_end: payload.time_end,
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
