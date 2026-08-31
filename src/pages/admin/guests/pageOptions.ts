import type { EventDay } from "../days/types"
import type { EventDaySegment, Invitation, RSVPMode } from "../invitation/types"
import { pageLabel } from "../invitation/utils"

/** A target invitation page a guest can attach to, with its own party-size
 *  limits + message-field visibility. */
export interface GuestPageOption {
  id: string
  label: string
  minGuest: number
  maxGuest: number
  showMessage: boolean
  /** The page's RSVP mode — a private page requires a phone (claim identity). */
  mode?: RSVPMode
}

/** Every page as a target option, in list order: by day, day-level page first,
 *  then creation order. One source for the create form, the import dialog and
 *  the bulk page sheet, so the three can't order or label pages differently. */
export function buildPageOptions(
  invitations: Invitation[],
  days: EventDay[],
  segments: EventDaySegment[],
): GuestPageOption[] {
  const dayIdx = (id: string) => days.findIndex((d) => d.id === id)
  return [...invitations]
    .sort((a, b) => {
      const byDay = dayIdx(a.day_id) - dayIdx(b.day_id)
      if (byDay !== 0) return byDay
      const rank = (s: string | null) => (s === null ? 0 : 1)
      const byRoot = rank(a.segment_id) - rank(b.segment_id)
      return byRoot !== 0 ? byRoot : a.created_at.localeCompare(b.created_at)
    })
    .map((p) => ({
      id: p.id,
      label: pageLabel(p, days, segments),
      minGuest: p.guest_count_min,
      maxGuest: p.guest_count_max,
      showMessage: p.rsvp_config.rsvp.fields.message.visible,
      mode: p.rsvp_mode,
    }))
}

// Party-size bounds across the selected pages: the count must fit ALL of them, so
// the allowed range is the intersection. `incompatible` = empty intersection.
export function pageBounds(selected: GuestPageOption[]) {
  if (selected.length === 0)
    return { minGuest: 1, maxGuest: 999, showMessage: false, incompatible: false }
  const minGuest = Math.max(...selected.map((p) => p.minGuest))
  const maxGuest = Math.min(...selected.map((p) => p.maxGuest))
  return {
    minGuest,
    maxGuest,
    showMessage: selected.some((p) => p.showMessage),
    incompatible: minGuest > maxGuest,
  }
}

/** The two pages whose limits can't be reconciled — the one demanding the most
 *  and the one allowing the least. Null when the selection has a shared range.
 *  Naming both is what lets the UI point at the conflict instead of the batch. */
export function boundsConflict(selected: GuestPageOption[]) {
  if (selected.length < 2) return null
  const floor = selected.reduce((a, b) => (b.minGuest > a.minGuest ? b : a))
  const ceiling = selected.reduce((a, b) => (b.maxGuest < a.maxGuest ? b : a))
  return floor.minGuest > ceiling.maxGuest ? { floor, ceiling } : null
}
