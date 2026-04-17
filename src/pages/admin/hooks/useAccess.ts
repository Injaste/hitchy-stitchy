import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"

type Resource = "timeline" | "tasks" | "team" | "settings" | "rsvp" | "announcements" | "vendors" | "members" | "roles" | "events" | "invitation" | "pages"
type Action = "create" | "read" | "update" | "delete"

export type Permission = `${Resource}:${Action}`
export type RoleCategory = "root" | "admin" | "couple_attendant" | "general"

async function fetchPermissions(category: RoleCategory): Promise<Permission[]> {
  if (category === "root") return [];

  const { data, error } = await supabase
    .from("event_role_permissions")
    .select("resource, can_create, can_read, can_update, can_delete")
    .eq("category", category)

  if (error || !data) throw new Error("Could not fetch permissions")

  return data.flatMap((row) => {
    const resource = row.resource as Resource
    const perms: Permission[] = []
    if (row.can_read) perms.push(`${resource}:read`)
    if (row.can_create) perms.push(`${resource}:create`)
    if (row.can_update) perms.push(`${resource}:update`)
    if (row.can_delete) perms.push(`${resource}:delete`)
    return perms
  })
}

export function useAccess() {
  const { memberRoleCategory: roleCategory, slug } = useAdminStore()
  const isRoot = roleCategory === "root"

  const { data: granted = [] } = useQuery({
    queryKey: [`${slug}:permissions`, roleCategory],
    queryFn: () => fetchPermissions(roleCategory as RoleCategory),
    enabled: !!roleCategory,
    staleTime: Infinity,
  })

  const allow = (...permissions: Permission[]): boolean => {
    if (isRoot) return true
    return permissions.every((p) => granted.includes(p))
  }

  const canRead = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:read`))
  const canCreate = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:create`))
  const canUpdate = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:update`))
  const canDelete = (...resources: Resource[]) => allow(...resources.map((r): Permission => `${r}:delete`))
  const canManage = (...resources: Resource[]) =>
    allow(...resources.flatMap((r): Permission[] => [`${r}:create`, `${r}:update`, `${r}:delete`]))

  return {
    roleCategory,
    canRead, canCreate, canUpdate, canDelete, canManage,
    isRoot: roleCategory === "root",
    isAdmin: roleCategory === "admin",
    isCoupleAttendant: roleCategory === "couple_attendant",
    isGeneral: roleCategory === "general",
  }
}