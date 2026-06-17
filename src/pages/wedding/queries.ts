import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvent, fetchRSVP, submitRSVP, updateRSVP, deleteRSVP } from "./api"
import type { RSVPFormData } from "./types"

// ─── Session helpers ─────────────────────────────────────────────────────────
// Keyed PER invitation page: a guest can RSVP to several pages of one event, so
// each page's session is stored separately (visiting page B mustn't surface page A).

const RSVP_KEY_PREFIX = "rsvp_session:"

interface RSVPSession {
  id: string
  phone: string
  token: string
}

function getRSVPSession(pageId: string): RSVPSession | null {
  try {
    const raw = localStorage.getItem(RSVP_KEY_PREFIX + pageId)
    return raw ? (JSON.parse(raw) as RSVPSession) : null
  } catch {
    return null
  }
}

function setRSVPSession(pageId: string, session: RSVPSession): void {
  localStorage.setItem(RSVP_KEY_PREFIX + pageId, JSON.stringify(session))
}

function clearRSVPSession(pageId: string): void {
  localStorage.removeItem(RSVP_KEY_PREFIX + pageId)
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const publicEventQueryKey = (slug: string, linkSlug?: string | null) =>
  ["public", slug, "event", linkSlug ?? null] as const
export const guestRSVPQueryKey = (event_id: string, id: string) => ["public", event_id, "rsvp", id] as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePublicEvent({ enabled = true }: { enabled?: boolean } = {}) {
  const { slug, link_slug } = useParams<{ slug: string; link_slug?: string }>()
  return useQuery({
    queryKey: publicEventQueryKey(slug!, link_slug ?? null),
    queryFn: () => fetchPublicEvent(slug!, link_slug ?? null),
    enabled: enabled && !!slug,
  })
}

export function usePublicEventRealtime(event_id: string | null) {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!event_id || !slug) return

    // Refresh on any change to this event's invitations (publish/unpublish/edit).
    // Invalidate the whole slug prefix so every page under it re-reads.
    const channel = supabase
      .channel(`public-event-${event_id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "event_invitations",
        filter: `event_id=eq.${event_id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["public", slug] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [event_id, slug, queryClient])
}

export function useGuestRSVP(event_id: string | null, invitation_id: string | null) {
  const session = invitation_id ? getRSVPSession(invitation_id) : null
  return useQuery({
    queryKey: guestRSVPQueryKey(event_id!, session?.id ?? ""),
    queryFn: () => fetchRSVP({ event_id: event_id!, id: session!.id, token: session!.token }),
    enabled: !!event_id && !!session,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────
// Submit targets the page (invitation_id) via submit_rsvp_v2; get/update/cancel
// stay keyed by the guest's token (the session is per page). The new-model _v2
// RPCs run only on this (undeployed) branch — production stays on the originals.

export function useRSVPMutations(event_id: string | null, invitation_id: string | null) {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const submit = useMutation(
    (formData: RSVPFormData) =>
      submitRSVP({
        invitation_id: invitation_id!,
        name: formData.name,
        phone: formData.phone,
        guest_count: formData.guestCount,
        message: formData.message ?? null,
        invite_code: searchParams.get("code"),
      }),
    {
      silent: true,
      onSuccess: (result) => {
        setRSVPSession(invitation_id!, { id: result.id, phone: result.phone, token: result.token })
        queryClient.invalidateQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  const update = useMutation(
    (formData: Partial<RSVPFormData>) => {
      const session = invitation_id ? getRSVPSession(invitation_id) : null
      return updateRSVP({
        event_id: event_id!,
        phone: session?.phone ?? "",
        token: session?.token ?? "",
        name: formData.name ?? null,
        guest_count: formData.guestCount ?? null,
        message: formData.message ?? null,
      })
    },
    {
      silent: true,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  const remove = useMutation(
    () => {
      const session = invitation_id ? getRSVPSession(invitation_id) : null
      return deleteRSVP({
        event_id: event_id!,
        phone: session?.phone ?? "",
        token: session?.token ?? "",
      })
    },
    {
      silent: true,
      onSuccess: () => {
        if (invitation_id) clearRSVPSession(invitation_id)
        queryClient.removeQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  return { submit, update, remove }
}
