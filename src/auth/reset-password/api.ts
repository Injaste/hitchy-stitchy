import type { ResetPasswordCredentials } from "./types"

export async function resetPassword(_credentials: ResetPasswordCredentials): Promise<void> {
  // Disabled until the /update-password page exists — the reset email redirects
  // there, so sending a link now would dead-end. Throw so the form surfaces a
  // message instead of faking success. To re-enable, restore the
  // supabase.auth.resetPasswordForEmail call with redirectTo
  // `${window.location.origin}/update-password` once that page ships.
  throw new Error("Password reset isn't available yet. Please contact support.")
}
