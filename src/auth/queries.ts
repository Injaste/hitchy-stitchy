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

export function useLoginMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<LoginCredentials, void>(loginUser, {
    silent: true,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useLogoutMutation(options?: {
  onSuccess?: () => void;
}) {
  return useMutation<void, void>(() => logoutUser(), {
    toast: {
      loading: "Logging out...",
      success: "You've been logged out.",
      error: "Failed to log out.",
    },
    onSuccess: options?.onSuccess,
  });
}