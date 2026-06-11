import { useQuery } from "@tanstack/react-query";
import { claimMemberInviteByToken } from "./api";

/**
 * Claims a pending invite by token, as a token-keyed query rather than a
 * fire-and-forget mutation. react-query dedupes by key and caches the result, so
 * the claim runs as ONE request and its outcome survives across remounts. This
 * matters because the login → join route transition (AnimatePresence) re-mounts
 * the join page; a per-mount mutation would restart and never settle. One-shot:
 * no retry, no refetch, result kept forever.
 */
export function useClaimInviteQuery(token: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["claim-invite", token],
    queryFn: () => claimMemberInviteByToken(token as string),
    enabled: enabled && !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
