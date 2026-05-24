import { supabase } from "@/lib/supabase"
import type { SignupCredentials, SubscribePayload } from "./types"

export async function signupUser({ fullName, email, password }: SignupCredentials): Promise<void> {
  return;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw new Error(error?.message)
}

export async function subscribeUser(payload: SubscribePayload): Promise<true> {
  const { error } = await supabase
    .from("subscribers")
    .insert({ email: payload.email });

  if (error) {
    if (error.code === "23505") throw new Error("You're already on the list!");
    throw new Error("An error occurred, please try again!");
  }

  return true;
}