import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAdminStore } from "../../store/useAdminStore"
import { adminKeys } from "../../lib/queryKeys"
import { subscribeToMembers } from "../../members/api"
import { subscribeToAccessGroups } from "../../access/api"
import type { Member } from "../../members/types"
import type { AccessGroup } from "../../access/types"

/**
 * Member fields the bootstrap context derives from. A change to the current
 * user's own row only needs to re-sync auth if one of these changed; edits to
 * notes/preferences/timestamps are ignored.
 *
 * NOTE: the field diff only fires when `event_members` has REPLICA IDENTITY
 * FULL — otherwise Postgres sends only the primary key in `payload.old`, the
 * diff always reads "changed", and we safely fall back to always refetching.
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
 * Always-on admin realtime: keeps the members + access-group list caches fresh
 * across the whole admin shell (cheap invalidate — these lists are small), and
 * re-syncs the bootstrap context (permissions, freeze/removal lock-out) only
 * when a change touches the current user's own member row or their access group.
 *
 * Mounted once in the bootstrap layer — not per-page.
 */
export function useAdminRealtime() {
  const { slug, eventId, memberId, memberAccessGroupId } = useAdminStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (!eventId || !slug) return

    const refetchBootstrap = () =>
      qc.invalidateQueries({ queryKey: adminKeys.bootstrap(slug) })

    const unsubMembers = subscribeToMembers(eventId, (payload) => {
      qc.invalidateQueries({ queryKey: adminKeys.members(slug) })

      const newRow = payload.new as Partial<Member>
      const oldRow = payload.old as Partial<Member>
      const isSelf = newRow.id === memberId || oldRow.id === memberId
      if (!isSelf) return

      // Removal, or a change to an auth-relevant field on our own row.
      if (
        payload.eventType !== "UPDATE" ||
        BOOTSTRAP_MEMBER_FIELDS.some((f) => newRow[f] !== oldRow[f])
      ) {
        refetchBootstrap()
      }
    })

    const unsubAccessGroups = subscribeToAccessGroups(eventId, (payload) => {
      // Members list shows the group name, so refresh it too (rename, delete).
      qc.invalidateQueries({ queryKey: adminKeys.accessGroups(slug) })
      qc.invalidateQueries({ queryKey: adminKeys.members(slug) })

      const newRow = payload.new as Partial<AccessGroup>
      const oldRow = payload.old as Partial<AccessGroup>
      const isMyGroup =
        newRow.id === memberAccessGroupId || oldRow.id === memberAccessGroupId
      if (!isMyGroup) return

      // Deletion of our group, or a name/permissions change, affects our context.
      if (
        payload.eventType !== "UPDATE" ||
        newRow.name !== oldRow.name ||
        JSON.stringify(newRow.permissions) !== JSON.stringify(oldRow.permissions)
      ) {
        refetchBootstrap()
      }
    })

    return () => {
      unsubMembers()
      unsubAccessGroups()
    }
  }, [eventId, slug, memberId, memberAccessGroupId, qc])
}
