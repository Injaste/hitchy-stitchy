import { supabase } from "@/lib/supabase"
import type { Event, CreateEventPayload } from "./types"
import type { PostgrestError } from "@supabase/supabase-js"

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchUserEvents(): Promise<Event[]> {
  const { data, error } = await supabase.rpc("get_user_events")
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Create Event ─────────────────────────────────────────────────────────────

export function getFriendlyErrorMessage(error: PostgrestError | null): string {
  if (error?.code === "23505") return "This URL slug is already taken. Please choose a different one.";
  else if (error?.message) return "Something went wrong. Please try again."
  return "Something went wrong. Please try again."
}

/** Hold the slug for this user while they finish the wizard. Returns the hold's
 *  expiry (ISO timestamp) so the wizard can warn near expiry. */
export async function reserveSlug(slug: string): Promise<string> {
  const { data, error } = await supabase.rpc("reserve_slug", { p_slug: slug })
  if (error) throw new Error(error.message)
  return data as string
}

/** Release any slug this user is holding (on leaving the wizard). */
export async function releaseSlug(): Promise<void> {
  await supabase.rpc("release_slug")
}

export async function createEvent(
  payload: CreateEventPayload
): Promise<Event> {
  const { data, error } = await supabase.rpc("create_event", {
    p_slug: payload.slug,
    p_name: payload.event_name,
    p_days: payload.days.map((d) => ({ date: d.date, label: d.label.trim() })),
    p_display_name: payload.display_name,
    p_role: payload.role_name,
  })

  if (error) throw new Error(getFriendlyErrorMessage(error))
  return data[0]
}
