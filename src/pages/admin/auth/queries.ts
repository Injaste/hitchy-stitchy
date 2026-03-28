import { useMutation } from "@/lib/query/useMutation";

import { loginUser, logoutUser } from "./api";
import type { LoginCredentials } from "./types";

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
  return useMutation<void, void>(
    () => logoutUser(),
    {
      toast: {
        loading: "Logging out...",
        success: "You've been logged out.",
        error: "Failed to log out.",
      },
      onSuccess: options?.onSuccess,
    }
  );
}
