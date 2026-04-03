import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { createEvent } from "./api"
import type { CreateEventPayload } from "./types"

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
``