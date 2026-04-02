import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

import type { LoginCredentials } from "./types";

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user ?? null;
}

export async function loginUser({ email, password }: LoginCredentials): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export function onAuthChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription.unsubscribe.bind(subscription);
}