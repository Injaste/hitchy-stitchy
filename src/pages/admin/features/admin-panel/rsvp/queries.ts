import { useQuery } from "@/lib/query/useQuery";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { getRSVPs, updateRSVPStatus } from "./api";
import type { RSVP } from "./types";

export function useRSVPs() {
  return useQuery(getRSVPs, { key: "rsvps" });
}

export function useRSVPMutations() {
  const { rsvps, setRsvps } = useAdminStore();

  const updateStatus = useMutation(
    (args: { id: string; status: RSVP["status"] }) => updateRSVPStatus(args),
    {
      successMessage: "RSVP status updated",
      errorMessage: "Failed to update RSVP status",
      onSuccess: ({ id, status }) => {
        setRsvps(rsvps.map((r) => (r.id === id ? { ...r, status } : r)));
      },
    }
  );

  return { updateStatus };
}
