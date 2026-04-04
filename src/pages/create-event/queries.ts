import { useMutation } from "@/lib/query/useMutation";
import { createEvent } from "./api";
import type { CreateEventPayload, CreateEventResult } from "./types";

export function useCreateEventMutation(options?: {
  onSuccess?: (data: CreateEventResult) => void
}) {
  return useMutation<CreateEventPayload, CreateEventResult>(
    (payload) => createEvent(payload),
    {
      silent: true,
      onSuccess: options?.onSuccess,
    }
  );
}