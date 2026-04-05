import { supabase } from "@/lib/supabase"
import type { Event } from "./types"
import { delay } from "@/lib/utils"

export async function fetchUserEvents(): Promise<Event[]> {
  await delay(2000)

  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, date_start, date_end")
    .order("date_start", { ascending: false })

  if (error) throw new Error(error.message)

  return data;
}
