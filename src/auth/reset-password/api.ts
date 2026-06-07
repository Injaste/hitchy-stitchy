import { supabase } from "@/lib/supabase"
import type { ResetPasswordCredentials } from "./types"

export async function resetPassword({ email }: ResetPasswordCredentials): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  })
  if (error) throw new Error(error.message)
}
