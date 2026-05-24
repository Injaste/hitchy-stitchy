import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";

import { getUser, loginUser, logoutUser, onAuthChange } from "./api";
import type { LoginCredentials } from "./types";

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

export const useUserQuery = () =>
  useQuery({
    queryKey: authQueryKey,
    queryFn: getUser,
    staleTime: Infinity,
  });

export const useUserIdQuery = () =>
  useQuery({
    queryKey: authQueryKey,
    queryFn: getUser,
    select: (user) => user?.id ?? null,
    staleTime: Infinity,
  });

export const useUserEmailQuery = () =>
  useQuery({
    queryKey: authQueryKey,
    queryFn: getUser,
    select: (user) => user?.email ?? null,
    staleTime: Infinity,
  });

export const useIsAuthenticatedQuery = () =>
  useQuery({
    queryKey: authQueryKey,
    queryFn: getUser,
    select: (user) => Boolean(user),
    staleTime: Infinity,
  });

export function useLoginMutation() {
  return useMutation(
    (credentials: LoginCredentials) => loginUser(credentials),
    { silent: true },
  );
}

export function useLogoutMutation() {
  return useMutation(
    () => logoutUser(),
    { silent: true },
  );
}