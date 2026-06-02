import { supabase } from "@/lib/supabase"
import type {
  Timeline,
  TimelineGrouped,
  CreateTimelineItemPayload,
  UpdateTimelineItemPayload,
  DeleteTimelineItemPayload,
  StartTimelinePayload,
  EndTimelinePayload,
} from "./types"
import { groupTimeline } from "./utils"

const TIMELINE_COLUMNS =
  "id, event_id, day, label, time_start, time_end, title, details, assignees, created_at, started_at, ended_at"

export async function fetchTimeline(eventId: string): Promise<TimelineGrouped> {
  const { data, error } = await supabase
    .from("event_timelines")
    .select(TIMELINE_COLUMNS)
    .eq("event_id", eventId)
    .order("day", { ascending: true })
    .order("time_start", { ascending: true })

  if (error) throw new Error(error.message)
  if (!data?.length) return { days: [], labels: [] }

  return groupTimeline(data as Timeline[])
}

export async function fetchActiveTimeline(eventId: string): Promise<Timeline | null> {
  const { data, error } = await supabase
    .from("event_timelines")
    .select(TIMELINE_COLUMNS)
    .eq("event_id", eventId)
    .not("started_at", "is", null)
    .is("ended_at", null)
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as Timeline | null) ?? null
}

export async function createTimelineItem(payload: CreateTimelineItemPayload): Promise<Timeline> {
  const { data, error } = await supabase.rpc("create_timeline", {
    p_event_id: payload.event_id,
    p_day: payload.day,
    p_label: payload.label,
    p_time_start: payload.time_start,
    p_time_end: payload.time_end,
    p_title: payload.title,
    p_details: payload.details,
    p_assignees: payload.assignees,
  })

  if (error) throw new Error(error.message)
  return data as Timeline
}

export async function updateTimelineItem(payload: UpdateTimelineItemPayload): Promise<Timeline> {
  const { data, error } = await supabase.rpc("update_timeline", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_day: payload.day,
    p_label: payload.label,
    p_time_start: payload.time_start,
    p_time_end: payload.time_end,
    p_title: payload.title,
    p_details: payload.details,
    p_assignees: payload.assignees,
  })

  if (error) throw new Error(error.message)
  return data as Timeline
}

export async function deleteTimelineItem(payload: DeleteTimelineItemPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_timeline", {
    p_event_id: payload.event_id,
    p_id: payload.id
  })

  if (error) throw new Error(error.message)
}

export async function startTimelineItem(payload: StartTimelinePayload): Promise<Timeline> {
  const { data, error } = await supabase.rpc("start_timeline", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })

  if (error) throw new Error(error.message)
  return data as Timeline
}

export async function endTimelineItem(payload: EndTimelinePayload): Promise<Timeline> {
  const { data, error } = await supabase.rpc("end_timeline", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })

  if (error) throw new Error(error.message)
  return data as Timeline
}