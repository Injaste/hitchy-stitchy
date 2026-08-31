import { useMemo } from "react"

import { useActiveEventDay } from "../../hooks/useActiveEventDay"
import {
  useInvitationsQuery,
  useEventSegmentsQuery,
} from "../../invitation/queries"
import { buildPageOptions } from "../pageOptions"
import { useGuestModalStore } from "./useGuestModalStore"

/**
 * The invitation pages a guest write should target, resolved exactly the way the
 * list resolves them: the active day when it has pages, otherwise the first day
 * that does, with the focused segment pre-selected. `allPages` spans every day,
 * for the surfaces that can put a guest on a page outside the day in view.
 */
export function useGuestTargetPages() {
  const activeInvitationId = useGuestModalStore((s) => s.activeInvitationId)
  const { days, activeDayId } = useActiveEventDay()
  const { data: invitations } = useInvitationsQuery()
  const { data: segments } = useEventSegmentsQuery()

  return useMemo(() => {
    const list = invitations ?? []
    const withPage = new Set(list.map((i) => i.day_id))
    const effectiveDayId =
      (activeDayId && withPage.has(activeDayId) ? activeDayId : null) ??
      days.find((d) => withPage.has(d.id))?.id ??
      null

    const pages = buildPageOptions(
      list.filter((i) => i.day_id === effectiveDayId),
      days,
      segments ?? [],
    )

    return {
      /** The effective day's pages, in list order. */
      pages,
      /** Every page of the event, day-ordered. */
      allPages: buildPageOptions(list, days, segments ?? []),
      effectiveDayId,
      /** The page the list is filtered to, when it belongs to the effective day. */
      focusedPageId: pages.some((p) => p.id === activeInvitationId)
        ? activeInvitationId
        : null,
    }
  }, [invitations, segments, days, activeDayId, activeInvitationId])
}
