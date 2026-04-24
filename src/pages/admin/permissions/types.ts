import type { RoleCategory } from "../types"

export type AccessLevel = "full" | "write" | "read" | "none"

export type Resource =
  | "timeline" | "tasks" | "members" | "roles" | "vendors"
  | "rsvp" | "invitation" | "settings" | "events" | "announcements" | "pages"

export interface ResourcePermission {
  resource: Resource
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
}

export interface CategoryPermissions {
  category: RoleCategory
  permissions: ResourcePermission[]
}

export interface ResourceGroup {
  label: string
  resources: Resource[]
}

export const RESOURCE_LABELS: Record<Resource, string> = {
  timeline: "Timeline",
  tasks: "Tasks",
  members: "Team Members",
  roles: "Roles",
  vendors: "Vendors",
  rsvp: "Guest RSVPs",
  invitation: "Invitation",
  settings: "Event Settings",
  events: "Event Details",
  announcements: "Announcements",
  pages: "Custom Pages",
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  { label: "Operations", resources: ["timeline", "tasks"] },
  { label: "Team", resources: ["members", "roles"] },
  { label: "Guests", resources: ["rsvp", "invitation"] },
  { label: "Content", resources: ["announcements", "vendors", "pages"] },
  { label: "Event", resources: ["events", "settings"] },
]

export const CATEGORY_DISPLAY: Record<RoleCategory, { label: string; description: string }> = {
  root: { label: "Root", description: "Event owners — full control" },
  admin: { label: "Admin", description: "Coordinators — manage everything" },
  couple_attendant: { label: "Attendant", description: "Attendants — view & contribute" },
  general: { label: "General", description: "Staff & guests — limited view" },
}

export const CATEGORY_ORDER: RoleCategory[] = ["root", "admin", "couple_attendant", "general"]

export function deriveAccessLevel(perm: ResourcePermission | undefined): AccessLevel {
  if (!perm) return "none"
  const { can_read, can_create, can_update, can_delete } = perm
  if (can_create && can_update && can_delete) return "full"
  if (can_create || can_update || can_delete) return "write"
  if (can_read) return "read"
  return "none"
}
