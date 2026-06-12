import { supabase } from "@/lib/supabase"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { EventDay } from "../days/types"
import type {
  Timeline,
  EventSegment,
  TimelineGrouped,
  CreateTimelineItemPayload,
  UpdateTimelineItemPayload,
  DeleteTimelineItemPayload,
  StartTimelinePayload,
  EndTimelinePayload,
  CreateSegmentPayload,
  UpdateSegmentPayload,
  DeleteSegmentPayload,
  ReorderSegmentsPayload,
} from "./types"
import { groupTimeline } from "./utils"

const TIMELINE_COLUMNS =
  "id, event_id, day, segment_id, label, time_start, time_end, title, details, assignees, created_at, started_at, ended_at"

export async function fetchTimeline(eventId: string): Promise<TimelineGrouped> {
  const [daysRes, segmentsRes, itemsRes] = await Promise.all([
    supabase
      .from("event_days")
      .select("id, date, label")
      .eq("event_id", eventId)
      .order("date", { ascending: true }),
    supabase
      .from("event_segments")
      .select("id, event_id, day_id, name, sort_order")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("event_timelines")
      .select(TIMELINE_COLUMNS)
      .eq("event_id", eventId)
      .order("time_start", { ascending: true }),
  ])

  if (daysRes.error) throw new Error(daysRes.error.message)
  if (segmentsRes.error) throw new Error(segmentsRes.error.message)
  if (itemsRes.error) throw new Error(itemsRes.error.message)

  return groupTimeline(
    (itemsRes.data ?? []) as Timeline[],
    (daysRes.data ?? []) as EventDay[],
    (segmentsRes.data ?? []) as EventSegment[],
  )
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
    p_segment_id: payload.segment_id,
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
    p_segment_id: payload.segment_id,
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

export async function createSegment(payload: CreateSegmentPayload): Promise<EventSegment> {
  const { data, error } = await supabase.rpc("create_segment", {
    p_event_id: payload.event_id,
    p_day_id: payload.day_id,
    p_name: payload.name,
  })

  if (error) throw new Error(error.message)
  return data as EventSegment
}

export async function updateSegment(payload: UpdateSegmentPayload): Promise<EventSegment> {
  const { data, error } = await supabase.rpc("update_segment", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name,
  })

  if (error) throw new Error(error.message)
  return data as EventSegment
}

export async function deleteSegment(payload: DeleteSegmentPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_segment", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  })

  if (error) throw new Error(error.message)
}

export async function reorderSegments(payload: ReorderSegmentsPayload): Promise<void> {
  const { error } = await supabase.rpc("reorder_segments", {
    p_event_id: payload.event_id,
    p_day_id: payload.day_id,
    p_ids: payload.ids,
  })

  if (error) throw new Error(error.message)
}

export function subscribeToTimeline(
  eventId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
): () => void {
  const channel = supabase
    .channel(`admin-timeline-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "event_timelines",
        filter: `event_id=eq.${eventId}`,
      },
      onChange,
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
