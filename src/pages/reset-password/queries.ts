import { useMutation } from "@/lib/query/useMutation"
import { resetPassword } from "./api"
import type { ResetPasswordCredentials } from "./types"

export function useResetPasswordMutation() {
  return useMutation(
    (credentials: ResetPasswordCredentials) => resetPassword(credentials),
    { silent: true },
  )
}
