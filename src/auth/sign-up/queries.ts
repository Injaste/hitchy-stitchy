import { useMutation } from "@/lib/query/useMutation"
import { signupUser } from "./api"
import type { SignupCredentials } from "./types"

export function useSignupMutation() {
  return useMutation(
    (credentials: SignupCredentials) => signupUser(credentials),
    { silent: true },
  )
}
