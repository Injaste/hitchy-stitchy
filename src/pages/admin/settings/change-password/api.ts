import { supabase } from "@/lib/supabase"
import type { ChangePasswordPayload } from "./types"

export async function changePassword({ password }: ChangePasswordPayload): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
