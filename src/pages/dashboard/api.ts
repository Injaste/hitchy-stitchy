import { supabase } from "@/lib/supabase"
import type { Event, ClaimInvitePayload, CreateEventPayload } from "./types"
import type { PostgrestError } from "@supabase/supabase-js"

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchUserEvents(): Promise<Event[]> {
  const { data, error } = await supabase.rpc("get_user_events")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function claimInvite(payload: ClaimInvitePayload): Promise<void> {
  const { error } = await supabase.rpc("claim_member_invite", {
    p_event_id: payload.event_id,
    p_action: payload.action,
  })
  if (error) throw new Error(error.message)
}

// ─── Create Event ─────────────────────────────────────────────────────────────

export function getFriendlyErrorMessage(error: PostgrestError | null): string {
  if (error?.code === "23505") return "This URL slug is already taken. Please choose a different one.";
  else if (error?.message) return "Something went wrong. Please try again."
  return "Something went wrong. Please try again."
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("event_slugs")
    .select("slug")
    .eq("slug", slug)

  if (error) throw new Error(getFriendlyErrorMessage(error))
  return data.length > 0
}

export async function createEvent(
  payload: CreateEventPayload
): Promise<Event> {
  const { data, error } = await supabase.rpc("create_event", {
    p_slug: payload.slug,
    p_name: payload.event_name,
    p_date_start: payload.date_start,
    p_date_end: payload.date_end,
    p_display_name: payload.display_name,
    p_role: payload.role_name,
  })

  if (error) throw new Error(getFriendlyErrorMessage(error))
  return data[0]
}
