import { supabase } from "@/lib/supabase";
import type {
  EventDay,
  DayItem,
  CreateDayPayload,
  UpdateDayPayload,
  DeleteDayPayload,
} from "./types";

export async function fetchEventDays(eventId: string): Promise<EventDay[]> {
  const { data, error } = await supabase
    .from("event_days")
    .select("id, date, label")
    .eq("event_id", eventId)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as EventDay[];
}

export async function createDay(payload: CreateDayPayload): Promise<EventDay> {
  const { data, error } = await supabase.rpc("create_day", {
    p_event_id: payload.event_id,
    p_date: payload.date,
    p_label: payload.label,
  });

  if (error) throw new Error(error.message);
  return data as EventDay;
}

export async function updateDay(payload: UpdateDayPayload): Promise<EventDay> {
  const { data, error } = await supabase.rpc("update_day", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_label: payload.label,
  });

  if (error) throw new Error(error.message);
  return data as EventDay;
}

/** Schedule items on a single day, for the delete-day modal. Items carry a
 *  denormalised `day` (yyyy-MM-dd) matching event_days.date. */
export async function fetchDayItems(
  eventId: string,
  date: string,
): Promise<DayItem[]> {
  const { data, error } = await supabase
    .from("event_timelines")
    .select("id, title")
    .eq("event_id", eventId)
    .eq("day", date)
    .order("time_start", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as DayItem[];
}

export async function deleteDay(payload: DeleteDayPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_day", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  });

  if (error) throw new Error(error.message);
}
