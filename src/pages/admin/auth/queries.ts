import { useMutation } from "@/lib/query/useMutation";

import { loginUser, logoutUser } from "./api";
import type { LoginCredentials } from "./types";

/**
 * Login mutation.
 * - Shows toast.success("Welcome back!") on success (AuthGate will swap to AdminPage)
 * - Shows toast.error on failure AND calls onError so Login.tsx can show inline error
 */
export function useLoginMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<LoginCredentials, void>(loginUser, {
    successMessage: "Welcome back!",
    errorMessage: "Incorrect password. Please try again.",
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

/**
 * Logout mutation.
 * - Calls logoutUser() which dispatches the auth:change event
 * - AuthGate re-renders and shows <Login /> automatically
 * - onSuccess can navigate away (e.g. to the invitation page)
 */
export function useLogoutMutation(options?: {
  onSuccess?: () => void;
}) {
  return useMutation<void, void>(
    () => logoutUser(),
    {
      successMessage: "You've been logged out.",
      errorMessage: "Failed to log out.",
      onSuccess: options?.onSuccess,
    }
  );
}
