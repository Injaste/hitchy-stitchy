import { supabase } from "@/lib/supabase"
import type { CreateEventPayload, CreateEventResult } from "./types"
import type { PostgrestError } from "@supabase/supabase-js";

export function getFriendlyErrorMessage(error: PostgrestError | null): string {
  const message = error?.message || "";

  if (message.includes('unique constraint "events_slug_key"')) {
    return "An event with this URL slug already exists. Please try a different slug.";
  }

  return "Something went wrong. Please try again.";
}

export async function getExistingSlug(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("event_slugs")
    .select("*")
    .eq("slug", slug)

  if (error || !data) throw new Error(getFriendlyErrorMessage(error))

  return data.length > 0;

}

export async function createEvent(
  payload: CreateEventPayload
): Promise<CreateEventResult> {
  console.log(payload);


  const { data, error } = await supabase.rpc("create_event", {
    p_slug: payload.slug,
    p_name: payload.event_name,
    p_date_start: payload.date_start,
    p_date_end: payload.date_end,
    p_display_name: payload.display_name,
    p_role_name: payload.role_name,
    p_role_short_name: payload.role_short_name
  })

  if (error || !data || !data.length) throw new Error(getFriendlyErrorMessage(error))

  return data[0];
}
