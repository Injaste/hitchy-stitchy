import { supabase } from "@/lib/supabase";
import type {
  Role,
  CreateRolePayload,
  UpdateRolePayload,
  DeleteRolePayload,
} from "./types";

const ROLE_FIELDS = "id, event_id, name, permissions, created_at, updated_at";

export async function fetchRoles(eventId: string): Promise<Role[]> {
  const { data, error } = await supabase
    .from("event_roles")
    .select(ROLE_FIELDS)
    .eq("event_id", eventId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Role[];
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data, error } = await supabase.rpc("create_role", {
    p_event_id: payload.event_id,
    p_name: payload.name,
  });

  if (error) throw new Error(error.message);
  return data as Role;
}

export async function updateRole(payload: UpdateRolePayload): Promise<Role> {
  const { data, error } = await supabase.rpc("update_role", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name ?? null,
    p_permissions: payload.permissions ?? null,
  });

  if (error) throw new Error(error.message);
  return data as Role;
}

export async function deleteRole(payload: DeleteRolePayload): Promise<void> {
  const { error } = await supabase.rpc("delete_role", {
    p_event_id: payload.event_id,
    p_id: payload.id,
  });
  if (error) throw new Error(error.message);
}
