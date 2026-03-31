import { supabase } from "@/lib/supabase"
import type { SignupCredentials } from "./types"

export async function signupUser({ fullName, email, password }: SignupCredentials): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw new Error(error.message)
}
