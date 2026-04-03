import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { getRSVPs, updateRSVPStatus } from "./api";
import type { RSVP } from "./types";

export const rsvpsQueryKey = ["rsvps"] as const;

export function useRSVPs() {
  return useQuery({
    queryKey: rsvpsQueryKey,
    queryFn: getRSVPs,
  });
}

export function useRSVPMutations() {
  const queryClient = useQueryClient();

  const updateStatus = useMutation(
    (args: { id: string; status: RSVP["status"] }) => updateRSVPStatus(args),
    {
      successMessage: "RSVP status updated",
      errorMessage: "Failed to update RSVP status",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: rsvpsQueryKey });
      },
    }
  );

  return { updateStatus };
}