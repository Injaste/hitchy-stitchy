import type { RoleCategory } from "../types"

export type AccessLevel = "full" | "write" | "read" | "none"

export type Resource =
  | "timeline"
  | "tasks"
  | "members"
  | "members.freeze"
  | "roles"
  | "vendors"
  | "rsvp"
  | "invitation"
  | "events"
  | "announcements"
  | "pages"

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
  "members.freeze": "Freeze Members",
  roles: "Roles",
  vendors: "Vendors",
  rsvp: "Guest RSVPs",
  invitation: "Invitation",
  events: "Event Details",
  announcements: "Announcements",
  pages: "Custom Pages",
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  { label: "Operations", resources: ["timeline", "tasks"] },
  { label: "Team", resources: ["members", "members.freeze", "roles"] },
  { label: "Guests", resources: ["rsvp", "invitation"] },
  { label: "Content", resources: ["announcements", "vendors", "pages"] },
  { label: "Event", resources: ["events"] },
]

export const CATEGORY_DISPLAY: Record<RoleCategory, { label: string; description: string }> = {
  root: { label: "Root", description: "Event owners — full control" },
  admin: { label: "Admin", description: "Coordinators — manage everything" },
  general: { label: "General", description: "Staff — limited access" },
}

export const CATEGORY_ORDER: RoleCategory[] = ["root", "admin", "general"]

export function deriveAccessLevel(perm: ResourcePermission | undefined): AccessLevel {
  if (!perm) return "none"
  const { can_read, can_create, can_update, can_delete } = perm
  if (can_create && can_update && can_delete) return "full"
  if (can_create || can_update || can_delete) return "write"
  if (can_read) return "read"
  return "none"
}