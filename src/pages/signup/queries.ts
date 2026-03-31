import { useMutation } from "@/lib/query/useMutation"
import { signupUser } from "./api"
import type { SignupCredentials } from "./types"

export function useSignupMutation(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  return useMutation<SignupCredentials, void>(signupUser, {
    silent: true,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}
