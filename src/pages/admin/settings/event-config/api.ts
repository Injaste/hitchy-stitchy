import { supabase } from "@/lib/supabase"
import type { EventConfig } from './types'

export async function fetchEventConfig(eventId: string): Promise<EventConfig> {
  const { data, error } = await supabase
    .from("events")
    .select("name, date_start, date_end")
    .eq("id", eventId)
    .is("deleted_at", null)
    .single()

  if (error) throw new Error(error.message)
  return { ...data, timezone: "" }
}

export async function updateEventConfig(
  payload: { eventId: string; config: EventConfig },
): Promise<EventConfig> {
  const { data, error } = await supabase
    .from("events")
    .update({
      name: payload.config.name,
      date_start: payload.config.date_start,
      date_end: payload.config.date_end,
    })
    .eq("id", payload.eventId)
    .select("name, date_start, date_end")
    .single()

  if (error) throw new Error(error.message)
  return { ...data, timezone: "" }
}
