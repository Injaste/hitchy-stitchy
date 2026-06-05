import { supabase } from "@/lib/supabase";
import type { AccessGroup } from "./types";

const ACCESS_GROUP_FIELDS = "id, event_id, name, permissions, created_at, updated_at";

export async function fetchAccessGroups(eventId: string): Promise<AccessGroup[]> {
  const { data, error } = await supabase
    .from("event_access_groups")
    .select(ACCESS_GROUP_FIELDS)
    .eq("event_id", eventId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as AccessGroup[];
}

/** Reads the event_resources catalog — the canonical list of resources that exist. */
export async function fetchResources(): Promise<string[]> {
  const { data, error } = await supabase.from("event_resources").select("resource");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.resource as string);
}
