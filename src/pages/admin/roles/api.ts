import { supabase } from "@/lib/supabase";
import type { Role, CreateRolePayload, UpdateRolePayload } from "./types";

const ROLE_FIELDS =
  "id, event_id, name, short_name, category, description, created_at, updated_at";

export async function fetchRoles(eventId: string): Promise<Role[]> {
  const { data, error } = await supabase
    .from("event_roles")
    .select(ROLE_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Role[];
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data, error } = await supabase.rpc("create_role", {
    p_event_id: payload.event_id,
    p_name: payload.name,
    p_short_name: payload.short_name,
    p_category: payload.category,
    p_description: payload.description,
  });

  if (error) throw new Error(error.message);
  return data as Role;
}

export async function updateRole(payload: UpdateRolePayload): Promise<void> {
  const { error } = await supabase.rpc("update_role", {
    p_id: payload.id,
    p_name: payload.name,
    p_short_name: payload.short_name,
    p_category: payload.category,
    p_description: payload.description,
  });

  if (error) throw new Error(error.message);
}

export async function deleteRole(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_role", { p_id: id });
  if (error) throw new Error(error.message);
}
