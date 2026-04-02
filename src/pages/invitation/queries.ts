import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { fetchPublicEvent, fetchRSVP, submitRSVP, updateRSVP, deleteRSVP } from "./api";
import type { NewRSVPSubmission } from "./types";

const PHONE_KEY = "rsvp_phone";
const TOKEN_KEY = "rsvp_cancel_token";

export const publicEventQueryKey = (slug: string) => ["public", slug, "event"] as const;
export const guestRSVPQueryKey = (eventId: string, phone: string) => ["public", eventId, "rsvp", phone] as const;

export function usePublicEvent() {
  const { slug } = useParams<{ slug: string }>();
  return useQuery({
    queryKey: publicEventQueryKey(slug!),
    queryFn: () => fetchPublicEvent(slug!),
    enabled: !!slug,
  });
}

export function useGuestRSVP(eventId: string | null) {
  const phone = localStorage.getItem(PHONE_KEY);
  return useQuery({
    queryKey: guestRSVPQueryKey(eventId!, phone!),
    queryFn: () => fetchRSVP(eventId!, phone!),
    enabled: !!eventId && !!phone,
  });
}

export function useRSVPMutations(eventId: string | null) {
  const queryClient = useQueryClient();

  const submit = useMutation(
    (submission: NewRSVPSubmission) => submitRSVP(eventId!, submission),
    {
      silent: true,
      onSuccess: (result) => {
        localStorage.setItem(PHONE_KEY, result.phone);
        localStorage.setItem(TOKEN_KEY, result.cancelToken);
        // invalidate so useGuestRSVP refetches with the new phone
        queryClient.invalidateQueries({ queryKey: ["public", eventId] });
      },
    }
  );

  const update = useMutation(
    ({ id, patch }: { id: string; patch: Partial<NewRSVPSubmission> }) =>
      updateRSVP(id, patch),
    {
      silent: true,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["public", eventId] });
      },
    }
  );

  const remove = useMutation(
    ({ id }: { id: string }) => {
      const cancelToken = localStorage.getItem(TOKEN_KEY) ?? "";
      return deleteRSVP(id, cancelToken);
    },
    {
      silent: true,
      onSuccess: () => {
        localStorage.removeItem(PHONE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        queryClient.removeQueries({ queryKey: ["public", eventId] });
      },
    }
  );

  return { submit, update, remove };
}