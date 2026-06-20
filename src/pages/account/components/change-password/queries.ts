import { useMutation } from "@/lib/query/useMutation"
import { changePassword } from "./api"
import type { ChangePasswordPayload } from "./types"

export function useChangePasswordMutation() {
  return useMutation(
    (payload: ChangePasswordPayload) => changePassword(payload),
    { successMessage: "Password updated.", errorMessage: (err) => err.message },
  )
}
