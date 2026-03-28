import { useParams } from "react-router-dom"
import { useQuery } from "@/lib/query/useQuery"
import { useMutation } from "@/lib/query/useMutation"
import { fetchPublicEvent, fetchRSVP, submitRSVP, updateRSVP, deleteRSVP } from "./api"
import type { NewRSVPSubmission } from "./types"

const PHONE_KEY = "rsvp_phone"
const TOKEN_KEY = "rsvp_cancel_token"

export function usePublicEvent() {
  const { slug } = useParams<{ slug: string }>()
  return useQuery(
    () => fetchPublicEvent(slug!),
    { key: `public:${slug}:event`, enabled: !!slug }
  )
}

export function useGuestRSVP(eventId: string | null) {
  const phone = localStorage.getItem(PHONE_KEY)
  return useQuery(
    () => fetchRSVP(eventId!, phone!),
    { key: `public:${eventId}:rsvp:${phone}`, enabled: !!eventId && !!phone }
  )
}

export function useRSVPMutations(eventId: string | null) {
  const submit = useMutation(
    (submission: NewRSVPSubmission) => submitRSVP(eventId!, submission),
    {
      silent: true,
      onSuccess: (result) => {
        localStorage.setItem(PHONE_KEY, result.phone)
        localStorage.setItem(TOKEN_KEY, result.cancelToken)
      },
    }
  )

  const update = useMutation(
    ({ id, patch }: { id: string; patch: Partial<NewRSVPSubmission> }) =>
      updateRSVP(id, patch),
    { silent: true }
  )

  const remove = useMutation(
    ({ id }: { id: string }) => {
      const cancelToken = localStorage.getItem(TOKEN_KEY) ?? ""
      return deleteRSVP(id, cancelToken)
    },
    {
      silent: true,
      onSuccess: () => {
        localStorage.removeItem(PHONE_KEY)
        localStorage.removeItem(TOKEN_KEY)
      },
    }
  )

  return { submit, update, remove }
}
