import { useMutation } from "@/lib/query/useMutation";
import { createEvent } from "./api";
import type { CreateEventPayload, CreateEventResult } from "./types";
import { useNavigate } from "react-router-dom";

export function useCreateEventMutation() {
  const navigate = useNavigate();

  return useMutation<CreateEventPayload, CreateEventResult>(
    (payload) => createEvent(payload),
    {
      silent: true,
      onSuccess: (data) => {
        navigate(`/${data.slug}/admin`);
      },
    }
  );
}