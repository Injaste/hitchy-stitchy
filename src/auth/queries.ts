import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";

import { getUser, logoutUser, onAuthChange } from "./api";

export const authQueryKey = ["auth", "user"] as const;

export function useAuthListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return onAuthChange((event, session) => {
      queryClient.setQueryData(authQueryKey, session?.user ?? null);

      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });
  }, [queryClient]);
}

export const useIsAuthenticatedQuery = () =>
  useQuery({
    queryKey: authQueryKey,
    queryFn: getUser,
    select: (user) => Boolean(user),
    staleTime: Infinity,
  });

export function useLogoutMutation() {
  return useMutation(() => logoutUser(), { silent: true });
}
