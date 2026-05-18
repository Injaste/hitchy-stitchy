import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useInvitationMutation } from "../../queries"
import type { UpdateInvitationPayload, RSVPMode } from "../../types"

export interface ConfigFormValues {
  event_date: string | null
  event_time_start: string | null
  event_time_end: string | null
  rsvp_mode: RSVPMode
  rsvp_deadline_date: string | null
  rsvp_deadline_time: string | null
  max_guests: number | null
  guest_count_min: number
  guest_count_max: number
  confirmation_message: string | null
  message_visible: boolean
  message_required: boolean
}

const pad = (n: number) => String(n).padStart(2, "0")

const combineDeadline = (
  date: string | null,
  time: string | null,
): string | null => {
  if (!date) return null
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = (time ?? "23:59").split(":").map(Number)
  if ([y, m, d, h, min].some(Number.isNaN)) return null
  const local = new Date(y, m - 1, d, h, min)
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`
}

export function useConfigSubmit() {
  const { eventId } = useAdminStore()
  const { update } = useInvitationMutation()

  const submit = (values: ConfigFormValues) => {
    const payload: UpdateInvitationPayload = {
      event_id: eventId!,
      event_date: values.event_date,
      event_time_start: values.event_time_start,
      event_time_end: values.event_time_end,
      rsvp_mode: values.rsvp_mode,
      rsvp_deadline: combineDeadline(
        values.rsvp_deadline_date,
        values.rsvp_deadline_time,
      ),
      max_guests: values.max_guests,
      guest_count_min: values.guest_count_min,
      guest_count_max: values.guest_count_max,
      confirmation_message: values.confirmation_message,
      config: {
        rsvp: {
          fields: {
            message: {
              visible: values.message_visible,
              required: values.message_visible
                ? values.message_required
                : false,
            },
          },
        },
      },
    }

    update.mutate(payload)
  }

  return { submit, mutation: update }
}
