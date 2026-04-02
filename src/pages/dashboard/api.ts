import { supabase } from "@/lib/supabase"
import type { Event } from "./types"

export async function fetchUserEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, date_start, date_end")
    .order("date_start", { ascending: false })

  if (error) throw new Error(error.message)
  return [
    {
      id: "0",
      name: "Dan & Nad's Wedding",
      slug: "dan-nad-wedding",
      date_start: "2026-04-01",
      date_end: "2026-04-07",
    },
    {
      id: "1",
      name: "Sarah & Tom's Wedding",
      slug: "sarah-tom-wedding",
      date_start: "2026-06-14",
      date_end: "2026-06-15",
    },
    {
      id: "2",
      name: "Emily's 30th Birthday",
      slug: "emily-30",
      date_start: "2026-08-03",
      date_end: "2026-08-03",
    },
    {
      id: "3",
      name: "Chen Family Reunion",
      slug: "chen-reunion-26",
      date_start: "2026-01-18",
      date_end: "2026-01-18",
    },
  ];
}
