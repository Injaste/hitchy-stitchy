import { supabase } from "@/lib/supabase";

import type { SubscribePayload } from "./types";

export async function subscribeUser(payload: SubscribePayload): Promise<true> {
  const { error } = await supabase
    .from("waitlist_signups")
    .insert({ email: payload.email });

  if (error) {
    if (error.code === "23505") throw new Error("You're already on the list!");
    throw new Error("An error occurred, please try again!");
  }

  return true;
}
