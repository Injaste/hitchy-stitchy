import { supabase } from "@/lib/supabase";
import type {
  EventDay,
  DayTimelineItem,
  DayExpense,
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

/** Timeline entries on a single day, for the delete-day modal. They carry a
 *  denormalised `day` (yyyy-MM-dd) matching event_days.date. */
export async function fetchDayTimeline(
  eventId: string,
  date: string,
): Promise<DayTimelineItem[]> {
  const { data, error } = await supabase
    .from("event_timelines")
    .select("id, title")
    .eq("event_id", eventId)
    .eq("day", date)
    .order("time_start", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as DayTimelineItem[];
}

/** Expenses tied to a single day, for the delete-day modal. They attach through
 *  the day's budget bucket (event_expenses.budget_id -> event_budget.day_id);
 *  that FK is RESTRICT, so they block removal like schedule items do. */
export async function fetchDayExpenses(
  eventId: string,
  dayId: string,
): Promise<DayExpense[]> {
  const { data, error } = await supabase
    .from("event_expenses")
    .select("id, item, event_budget!inner(day_id)")
    .eq("event_id", eventId)
    .eq("event_budget.day_id", dayId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(({ id, item }) => ({ id, item }));
}

export async function deleteDay(payload: DeleteDayPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_day", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  });

  if (error) throw new Error(error.message);
}
