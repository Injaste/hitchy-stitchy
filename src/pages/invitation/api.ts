import { supabase } from "@/lib/supabase"
import type { PublicEventConfig, RSVPSubmission, NewRSVPSubmission } from "./types"
import type { RSVPFormConfig } from "@/pages/admin/features/settings/types"

const DEFAULT_RSVP_FORM: RSVPFormConfig = {
  fields: {
    name:         { visible: true,  required: true  },
    phone:        { visible: true,  required: true  },
    guestsCount:  { visible: true,  required: true  },
    dietaryNotes: { visible: false, required: false },
    mealChoice:   { visible: false, required: false },
    message:      { visible: false, required: false },
  },
  mode: "open",
  guestMin: 1,
  guestMax: 10,
  confirmationMessage: "We look forward to celebrating with you!",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function derivePublicEventConfig(row: any): PublicEventConfig {
  const s = (row.settings ?? {}) as Record<string, unknown>
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    dateStart: new Date(row.date_start),
    dateEnd: new Date(row.date_end),
    groomName: (s.groom_name as string) ?? "",
    brideName: (s.bride_name as string) ?? "",
    venueName: (s.venue_name as string) ?? "",
    venueAddress: (s.venue_address as string) ?? "",
    venueMapEmbedUrl: (s.venue_map_embed_url as string) ?? "",
    venueMapLink: (s.venue_map_link as string) ?? "",
    startTime: (s.start_time as string) ?? "",
    endTime: (s.end_time as string) ?? "",
    attire: (s.attire as string) ?? "",
    blessingsName: (s.blessings_name as string) ?? "",
    blessingsLabel: (s.blessings_label as string) ?? "",
    rsvpForm: (s.rsvp_form as RSVPFormConfig) ?? DEFAULT_RSVP_FORM,
    rsvpDeadlineEnabled: (s.rsvp_deadline_enabled as boolean) ?? false,
    rsvpDeadline: s.rsvp_deadline ? new Date(s.rsvp_deadline as string) : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRsvpRow(row: any): RSVPSubmission {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    guestsCount: row.guests_count ?? row.guestsCount ?? 0,
    dietaryNotes: row.dietary_notes ?? row.dietaryNotes,
    message: row.message,
    status: row.status ?? "Pending",
    cancelToken: row.cancel_token ?? row.cancelToken ?? "",
    submittedAt: row.submitted_at ?? row.submittedAt ?? "",
  }
}

export async function fetchPublicEvent(slug: string): Promise<PublicEventConfig> {
  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, date_start, date_end, settings")
    .eq("slug", slug)
    .single()
  if (error || !data) throw new Error("Event not found")
  return derivePublicEventConfig(data)
}

export async function fetchRSVP(
  eventId: string,
  phone: string
): Promise<RSVPSubmission | null> {
  const { data } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId)
    .eq("phone", phone)
    .maybeSingle()
  return data ? mapRsvpRow(data) : null
}

export async function submitRSVP(
  eventId: string,
  submission: NewRSVPSubmission
): Promise<RSVPSubmission> {
  const cancelToken = crypto.randomUUID()
  const { data, error } = await supabase
    .from("rsvps")
    .upsert(
      {
        name: submission.name,
        phone: submission.phone,
        guests_count: submission.guestsCount,
        dietary_notes: submission.dietaryNotes,
        message: submission.message,
        event_id: eventId,
        cancel_token: cancelToken,
      },
      { onConflict: "event_id,phone" }
    )
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapRsvpRow(data)
}

export async function updateRSVP(
  id: string,
  patch: Partial<NewRSVPSubmission>
): Promise<RSVPSubmission> {
  const { data, error } = await supabase
    .from("rsvps")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.phone !== undefined && { phone: patch.phone }),
      ...(patch.guestsCount !== undefined && { guests_count: patch.guestsCount }),
      ...(patch.dietaryNotes !== undefined && { dietary_notes: patch.dietaryNotes }),
      ...(patch.message !== undefined && { message: patch.message }),
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapRsvpRow(data)
}

export async function deleteRSVP(id: string, cancelToken: string): Promise<void> {
  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("id", id)
    .eq("cancel_token", cancelToken)
  if (error) throw new Error(error.message)
}
