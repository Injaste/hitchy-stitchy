import { eachDayOfInterval, parseISO } from "date-fns"
import type { EventConfig, EventDay, RSVPFormConfig } from "./types"

const DEFAULT_RSVP_FORM: RSVPFormConfig = {
  fields: {
    name:         { visible: true,  required: true  },
    phone:        { visible: true,  required: true  },
    guestsCount:  { visible: true,  required: true  },
    dietaryNotes: { visible: true,  required: false },
    mealChoice:   { visible: false, required: false },
    message:      { visible: false, required: false },
  },
  mode: "open",
  guestMin: 1,
  guestMax: 10,
  confirmationMessage: "Jazak Allah Khair! We look forward to celebrating with you.",
}

export function deriveEventConfig(row: {
  id: string
  slug: string
  name: string
  date_start: string
  date_end: string
  settings: Record<string, unknown>
}): EventConfig {
  const from = parseISO(row.date_start)
  const to = parseISO(row.date_end)

  const settingsDays = (row.settings?.days ?? []) as Array<{
    id?: string
    label?: string
    venue?: string
  }>

  const days: EventDay[] = eachDayOfInterval({ start: from, end: to }).map(
    (date, index) => {
      const id = `day-${index + 1}`
      const override = settingsDays.find((d) => d.id === id) ?? settingsDays[index]
      return {
        id,
        date,
        label: override?.label ?? `Day ${index + 1}`,
        venue: override?.venue ?? "",
      }
    }
  )

  const rsvpForm = row.settings?.rsvpForm
    ? (row.settings.rsvpForm as RSVPFormConfig)
    : DEFAULT_RSVP_FORM

  return {
    name: row.name,
    dateRange: { from, to },
    days,
    rsvpDeadlineEnabled: (row.settings?.rsvpDeadlineEnabled as boolean) ?? false,
    rsvpDeadline: row.settings?.rsvpDeadline
      ? parseISO(row.settings.rsvpDeadline as string)
      : null,
    rsvpForm,
  }
}
