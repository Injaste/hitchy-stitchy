import { supabase } from "@/lib/supabase";

import type { LoginCredentials } from "./types";

export async function loginUser({ email, password }: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data.user;
}
