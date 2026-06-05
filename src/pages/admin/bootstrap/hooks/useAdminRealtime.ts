import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAdminStore } from "../../store/useAdminStore"
import { adminKeys } from "../../lib/queryKeys"
import { subscribeToMembers } from "../../members/api"
import type { Member } from "../../members/types"

/**
 * Auth-relevant fields on the current user's own row. A change to any of these
 * re-syncs the bootstrap context (permissions, couple status, freeze/removal);
 * edits to notes/preferences/timestamps are ignored.
 *
 * NOTE: the field diff only fires when `event_members` has REPLICA IDENTITY FULL
 * — otherwise Postgres sends only the PK in `payload.old`, the diff reads
 * "changed", and we safely fall back to always re-bootstrapping.
 */
const BOOTSTRAP_MEMBER_FIELDS: (keyof Member)[] = [
  "display_name",
  "role",
  "access_group_id",
  "is_bride",
  "is_groom",
  "is_root",
  "frozen_at",
  "rejected_at",
]

/**
 * Live self-resync. RLS scopes event_members reads to the caller's own row, so
 * this subscription only ever receives changes to YOUR row — including your own
 * freeze/removal, which locks you out instantly. The roster list is read via the
 * gated get_members RPC and refreshes on focus/navigation.
 *
 * Mounted once in the bootstrap layer — not per-page.
 */
export function useAdminRealtime() {
  const { slug, eventId } = useAdminStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (!eventId || !slug) return

    const unsub = subscribeToMembers(eventId, (payload) => {
      // Your own row changed — refresh the roster cache…
      qc.invalidateQueries({ queryKey: adminKeys.members(slug) })

      // …and re-bootstrap if an auth-relevant field changed (or on removal).
      const newRow = payload.new as Partial<Member>
      const oldRow = payload.old as Partial<Member>
      if (
        payload.eventType !== "UPDATE" ||
        BOOTSTRAP_MEMBER_FIELDS.some((f) => newRow[f] !== oldRow[f])
      ) {
        qc.invalidateQueries({ queryKey: adminKeys.bootstrap(slug) })
      }
    })

    return unsub
  }, [eventId, slug, qc])
}
