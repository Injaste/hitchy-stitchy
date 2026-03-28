import { supabase } from "@/lib/supabase"
import { dispatchAuthChange } from "./events"
import type { LoginCredentials } from "./types"

export async function loginUser({ email, password }: LoginCredentials): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  dispatchAuthChange("login")
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
  dispatchAuthChange("logout")
}
