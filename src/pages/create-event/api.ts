import { supabase } from "@/lib/supabase"
import type { CreateEventPayload, CreateEventResult } from "./types"

export async function createEvent(
  payload: CreateEventPayload
): Promise<CreateEventResult> {
  const { data, error } = await supabase.functions.invoke("onboard-event", {
    body: payload,
  })
  if (error || !data) throw new Error(error?.message ?? "Failed to create event")
  return data as CreateEventResult
}
