import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";

import { authQueryKey } from "../queries";
import { loginUser } from "./api";
import type { LoginCredentials } from "./types";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation((credentials: LoginCredentials) => loginUser(credentials), {
    silent: true,
    // Write the authenticated user into the auth cache the moment login
    // succeeds. The standalone /login page renders outside <AuthGate>, so the
    // session listener that normally syncs this isn't mounted here. Without it,
    // a post-login redirect to a gated page (e.g. /:slug/admin) would read the
    // stale "logged out" cache (staleTime: Infinity → no refetch) and bounce
    // the user straight back to /login — an infinite loop.
    onSuccess: (user) => queryClient.setQueryData(authQueryKey, user),
  });
}
