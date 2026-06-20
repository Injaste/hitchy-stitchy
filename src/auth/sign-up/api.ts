import { supabase } from "@/lib/supabase"
import type { SignupCredentials } from "./types"

export async function signupUser({
  fullName,
  email,
  password,
}: SignupCredentials): Promise<void> {
  // full_name rides along as auth metadata; the on_auth_user_created trigger
  // (20260621000001) copies it into profiles.name. Requires "Enable signups" ON
  // in the Supabase Auth dashboard — re-opened from the prior beta waitlist gate.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(error.message)
}
