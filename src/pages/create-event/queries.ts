import { useQuery, useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { createEvent, getExistingSlug } from "./api"
import type { CreateEventPayload } from "./types"

export function useCheckSlugMutation() {
  return useMutation({
    mutationKey: ["check-slug"],
    mutationFn: (slug: string) => getExistingSlug(slug),
    gcTime: 0,
  });
}

export function useCreateEventMutation() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: (data) => {
      console.log(data);

      navigate(`/${data.slug}/admin`)
    },
  })
}
