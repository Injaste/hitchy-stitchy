import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvent, fetchRSVP, submitRSVP, updateRSVP, deleteRSVP } from "./api"
import type { RSVPFormData } from "./types"

// ─── Session helpers ─────────────────────────────────────────────────────────

const RSVP_KEY = "rsvp_session"

interface RSVPSession {
  id: string
  phone: string
  token: string
}

function getRSVPSession(): RSVPSession | null {
  try {
    const raw = localStorage.getItem(RSVP_KEY)
    return raw ? (JSON.parse(raw) as RSVPSession) : null
  } catch {
    return null
  }
}

function setRSVPSession(session: RSVPSession): void {
  localStorage.setItem(RSVP_KEY, JSON.stringify(session))
}

function clearRSVPSession(): void {
  localStorage.removeItem(RSVP_KEY)
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const publicEventQueryKey = (slug: string) => ["public", slug, "event"] as const
export const guestRSVPQueryKey = (event_id: string, id: string) => ["public", event_id, "rsvp", id] as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePublicEvent() {
  const { slug } = useParams<{ slug: string }>()
  return useQuery({
    queryKey: publicEventQueryKey(slug!),
    queryFn: () => fetchPublicEvent(slug!),
    enabled: !!slug,
  })
}

export function usePublicEventRealtime(event_id: string | null) {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!event_id || !slug) return

    const channel = supabase
      .channel(`public-event-${event_id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "event_invitation",
        filter: `event_id=eq.${event_id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: publicEventQueryKey(slug) })
      })
      .on("postgres_changes", {
        event: "*", schema: "public", table: "event_themes",
        filter: `event_id=eq.${event_id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: publicEventQueryKey(slug) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [event_id, slug, queryClient])
}

export function useGuestRSVP(event_id: string | null) {
  const session = getRSVPSession()
  return useQuery({
    queryKey: guestRSVPQueryKey(event_id!, session?.id ?? ""),
    queryFn: () => fetchRSVP({ event_id: event_id!, id: session!.id, token: session!.token }),
    enabled: !!event_id && !!session,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useRSVPMutations(event_id: string | null) {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const submit = useMutation(
    (formData: RSVPFormData) =>
      submitRSVP({
        event_id: event_id!,
        name: formData.name,
        phone: formData.phone,
        guest_count: formData.guestCount,
        message: formData.message ?? null,
        invite_code: searchParams.get("code"),
      }),
    {
      silent: true,
      onSuccess: (result) => {
        setRSVPSession({ id: result.id, phone: result.phone, token: result.token })
        queryClient.invalidateQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  const update = useMutation(
    (formData: Partial<RSVPFormData>) => {
      const session = getRSVPSession()
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
      const session = getRSVPSession()
      return deleteRSVP({
        event_id: event_id!,
        phone: session?.phone ?? "",
        token: session?.token ?? "",
      })
    },
    {
      silent: true,
      onSuccess: () => {
        clearRSVPSession()
        queryClient.removeQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  return { submit, update, remove }
}
