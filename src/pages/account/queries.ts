import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { fetchProfile, updateProfileName, uploadAvatar } from "./api"
import type { Profile } from "./types"

export const profileQueryKey = ["profile"] as const

export function useProfileQuery() {
  return useQuery<Profile>({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
  })
}

export function useUpdateProfileNameMutation() {
  const qc = useQueryClient()
  // Toasts on save/fail (not silent) — the name field commits inline on
  // blur/Enter with no Save button, so the toast is the only success signal.
  return useMutation((name: string) => updateProfileName(name), {
    successMessage: (name: string) => `Greetings ${name}!`,
    errorMessage: (err) => err.message,
    onSuccess: (_res, name) => {
      qc.setQueryData<Profile>(profileQueryKey, (old) =>
        old ? { ...old, name: name.trim() } : old,
      )
    },
  })
}

export function useUpdateAvatarMutation() {
  const qc = useQueryClient()
  return useMutation((file: File) => uploadAvatar(file), {
    successMessage: "Photo updated.",
    errorMessage: (err) => err.message,
    onSuccess: (url) => {
      qc.setQueryData<Profile>(profileQueryKey, (old) =>
        old ? { ...old, avatar_url: url } : old,
      )
    },
  })
}
