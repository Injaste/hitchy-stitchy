import { supabase } from "@/lib/supabase"
import type { UserEvent } from "./types"

export async function fetchUserEvents(): Promise<UserEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, date_start, date_end")
    .order("date_start", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
