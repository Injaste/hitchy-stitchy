import { useMutation } from "@/lib/query/useMutation"
import { signupUser, subscribeUser } from "./api"
import type { SignupCredentials, SubscribePayload } from "./types"

export function useSignupMutation() {
  return useMutation(
    (credentials: SignupCredentials) => signupUser(credentials),
    { silent: true },
  )
}

export function useSubscribeMutation() {
  return useMutation(
    (payload: SubscribePayload) => subscribeUser(payload),
    {
      silent: true,
    },
  )
}
