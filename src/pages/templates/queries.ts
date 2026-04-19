import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { supabase } from "@/lib/supabase"
import { fetchPublicEvent, fetchRSVP, submitRSVP, updateRSVP, deleteRSVP } from "./api"
import type { RSVPFormData } from "./types"

const PHONE_KEY = "rsvp_phone"
const TOKEN_KEY = "rsvp_cancel_token"

export const publicEventQueryKey = (slug: string) => ["public", slug, "event"] as const
export const guestRSVPQueryKey = (event_id: string, phone: string) => ["public", event_id, "rsvp", phone] as const

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
  const phone = localStorage.getItem(PHONE_KEY)
  return useQuery({
    queryKey: guestRSVPQueryKey(event_id!, phone!),
    queryFn: () => fetchRSVP(event_id!, phone!),
    enabled: !!event_id && !!phone,
  })
}

export function useRSVPMutations(event_id: string | null) {
  const queryClient = useQueryClient()

  const submit = useMutation(
    (formData: RSVPFormData) => submitRSVP(event_id!, formData),
    {
      silent: true,
      onSuccess: (result) => {
        if (result.phone) localStorage.setItem(PHONE_KEY, result.phone)
        localStorage.setItem(TOKEN_KEY, result.cancel_token)
        queryClient.invalidateQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  const update = useMutation(
    (formData: Partial<RSVPFormData>) => {
      const phone = localStorage.getItem(PHONE_KEY) ?? ""
      const cancel_token = localStorage.getItem(TOKEN_KEY) ?? ""
      return updateRSVP(event_id!, phone, cancel_token, formData)
    },
    {
      silent: true,
      onSuccess: (result) => {
        if (result.phone) localStorage.setItem(PHONE_KEY, result.phone)
        localStorage.setItem(TOKEN_KEY, result.cancel_token)
        queryClient.invalidateQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  const remove = useMutation(
    () => {
      const phone = localStorage.getItem(PHONE_KEY) ?? ""
      const cancel_token = localStorage.getItem(TOKEN_KEY) ?? ""
      return deleteRSVP(event_id!, phone, cancel_token)
    },
    {
      silent: true,
      onSuccess: () => {
        localStorage.removeItem(PHONE_KEY)
        localStorage.removeItem(TOKEN_KEY)
        queryClient.removeQueries({ queryKey: ["public", event_id] })
      },
    }
  )

  return { submit, update, remove }
}
