import { supabase } from "@/lib/supabase"
import type { RoleCategory } from "../types"
import type { Resource, ResourcePermission, CategoryPermissions } from "./types"

const ALL_RESOURCES: Resource[] = [
  "timeline", "tasks", "members", "roles", "vendors",
  "rsvp", "invitation", "settings", "events", "announcements", "pages",
]

const rootPermissions: ResourcePermission[] = ALL_RESOURCES.map((resource) => ({
  resource,
  can_read: true,
  can_create: true,
  can_update: true,
  can_delete: true,
}))

// TODO: replace with live Supabase query
export async function fetchAllPermissions(): Promise<CategoryPermissions[]> {
  const categories: RoleCategory[] = ["admin", "couple_attendant", "general"]

  const { data, error } = await supabase
    .from("event_role_permissions")
    .select("category, resource, can_read, can_create, can_update, can_delete")
    .in("category", categories)

  if (error) throw new Error("Could not fetch permissions")

  const categoryMap = new Map<RoleCategory, ResourcePermission[]>()

  for (const row of data ?? []) {
    const cat = row.category as RoleCategory
    if (!categoryMap.has(cat)) categoryMap.set(cat, [])
    categoryMap.get(cat)!.push({
      resource: row.resource as Resource,
      can_read: row.can_read,
      can_create: row.can_create,
      can_update: row.can_update,
      can_delete: row.can_delete,
    })
  }

  return [
    { category: "root", permissions: rootPermissions },
    ...categories.map((cat) => ({
      category: cat,
      permissions: categoryMap.get(cat) ?? [],
    })),
  ]
}
