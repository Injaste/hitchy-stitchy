import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"

type Resource = "timeline" | "team" | "settings" | "rsvp" | "announcements" | "vendors" | "members" | "roles" | "events"
type Action = "create" | "read" | "update" | "delete"

export type Permission = `${Resource}:${Action}`
export type RoleCategory = "root" | "admin" | "couple_attendant" | "general"

interface RoleAccess {
  roleCategory: RoleCategory
  permissions: Permission[]
}

async function fetchRoleAccess(eventId: string): Promise<RoleAccess> {
  const { data: member, error: memberError } = await supabase
    .from("event_members")
    .select("event_roles(category)")
    .eq("event_id", eventId)
    .eq("is_frozen", false)
    .maybeSingle()

  if (memberError || !member) throw new Error("Could not fetch role")

  const category = (member as any).event_roles?.category as RoleCategory

  const { data: perms, error: permsError } = await supabase
    .from("event_role_permissions")
    .select("resource, can_create, can_read, can_update, can_delete")
    .eq("category", category)

  if (permsError || !perms) throw new Error("Could not fetch permissions")

  const permissions: Permission[] = perms.flatMap((row) => {
    const resource = row.resource as Resource
    const actions: Permission[] = []
    if (row.can_read) actions.push(`${resource}:read`)
    if (row.can_create) actions.push(`${resource}:create`)
    if (row.can_update) actions.push(`${resource}:update`)
    if (row.can_delete) actions.push(`${resource}:delete`)
    return actions
  })

  return { roleCategory: category, permissions }
}

export function useAccess() {
  const { eventId, slug } = useAdminStore()

  const { data } = useQuery({
    queryKey: [`${slug}:role-access`],
    queryFn: () => fetchRoleAccess(eventId!),
    enabled: !!eventId,
    staleTime: Infinity,
  })

  const roleCategory = data?.roleCategory
  const granted = data?.permissions ?? []

  const allow = (...permissions: Permission[]): boolean =>
    permissions.every((p) => granted.includes(p))

  const canRead = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:read`))
  const canCreate = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:create`))
  const canUpdate = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:update`))
  const canDelete = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:delete`))
  const canManage = (...resources: Resource[]) =>
    allow(...resources.flatMap((r): Permission[] => [`${r}:create`, `${r}:update`, `${r}:delete`]))

  return {
    roleCategory,
    allow,
    canRead, canCreate, canUpdate, canDelete, canManage,
    isRoot: roleCategory === "root",
    isAdmin: roleCategory === "admin",
    isCoupleAttendant: roleCategory === "couple_attendant",
    isGeneral: roleCategory === "general",
  }
}