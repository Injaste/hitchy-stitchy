import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type {
  AccessGroup,
  CreateAccessGroupPayload,
  UpdateAccessGroupPayload,
  DeleteAccessGroupPayload,
} from "./types";

const ACCESS_GROUP_FIELDS = "id, event_id, name, permissions, created_at, updated_at";

export async function fetchAccessGroups(eventId: string): Promise<AccessGroup[]> {
  const { data, error } = await supabase
    .from("event_access_groups")
    .select(ACCESS_GROUP_FIELDS)
    .eq("event_id", eventId)
    .neq("name", "SuperAdmin")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as AccessGroup[];
}

export async function createAccessGroup(payload: CreateAccessGroupPayload): Promise<AccessGroup> {
  const { data, error } = await supabase.rpc("create_access_group", {
    p_event_id: payload.event_id,
    p_name: payload.name,
  });

  if (error) throw new Error(error.message);
  return data as AccessGroup;
}

export async function updateAccessGroup(payload: UpdateAccessGroupPayload): Promise<AccessGroup> {
  const { data, error } = await supabase.rpc("update_access_group", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name ?? null,
    p_permissions: payload.permissions ?? null,
  });

  if (error) throw new Error(error.message);
  return data as AccessGroup;
}

export async function deleteAccessGroup(payload: DeleteAccessGroupPayload): Promise<void> {
  const { error } = await supabase.rpc("delete_access_group", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  });
  if (error) throw new Error(error.message);
}

export async function fetchAvailableResources(): Promise<string[]> {
  const { data, error } = await supabase
    .from("event_resources")
    .select("resource");
  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((row) => row.resource as string))];
}

export function subscribeToAccessGroups(
  eventId: string,
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
): () => void {
  const channel = supabase
    .channel(`admin-access-groups-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "event_access_groups",
        filter: `event_id=eq.${eventId}`,
      },
      onChange,
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
