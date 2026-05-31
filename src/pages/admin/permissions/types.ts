export type AccessLevel = "full" | "write" | "read" | "none"

export type Resource =
  | "timeline"
  | "tasks"
  | "members"
  | "members.freeze"
  | "roles"
  | "vendors"
  | "guests"
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
  guests: "Guest RSVPs",
  invitation: "Invitation",
  events: "Event Details",
  announcements: "Announcements",
  pages: "Custom Pages",
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  { label: "Operations", resources: ["timeline", "tasks"] },
  { label: "Team", resources: ["members", "members.freeze", "roles"] },
  { label: "Guests", resources: ["guests", "invitation"] },
  { label: "Content", resources: ["announcements", "vendors", "pages"] },
  { label: "Event", resources: ["events"] },
]

export const ALL_RESOURCES: Resource[] = RESOURCE_GROUPS.flatMap((g) => g.resources)

// Resources where only `can_update` is meaningful.
const UPDATE_ONLY_RESOURCES = new Set<Resource>(["members.freeze"])

export function deriveAccessLevel(perm: ResourcePermission | undefined, resource?: Resource): AccessLevel {
  if (!perm) return "none"
  const { can_read, can_create, can_update, can_delete } = perm
  if (resource && UPDATE_ONLY_RESOURCES.has(resource) && can_update) return "full"
  if (can_create && can_update && can_delete) return "full"
  if (can_create || can_update || can_delete) return "write"
  if (can_read) return "read"
  return "none"
}

/**
 * Expand a nested permissions jsonb entry into a ResourcePermission struct.
 * DB shape: { "tasks": { "create": true, "read": false, ... } }
 */
export function getResourcePermission(
  permissions: Record<string, Record<string, boolean>>,
  resource: Resource,
): ResourcePermission {
  const r = permissions[resource] ?? {}
  return {
    resource,
    can_read: r["read"] ?? false,
    can_create: r["create"] ?? false,
    can_update: r["update"] ?? false,
    can_delete: r["delete"] ?? false,
  }
}

/** Apply an access level back to the nested permissions object. */
export function applyAccessLevel(
  permissions: Record<string, Record<string, boolean>>,
  resource: Resource,
  level: AccessLevel,
): Record<string, Record<string, boolean>> {
  const isUpdateOnly = UPDATE_ONLY_RESOURCES.has(resource)
  const current = permissions[resource] ?? {}

  let next: Record<string, boolean>
  if (isUpdateOnly) {
    next = { ...current, update: level === "full" }
  } else {
    next = {
      ...current,
      read: level !== "none",
      create: level === "write" || level === "full",
      update: level === "write" || level === "full",
      delete: level === "full",
    }
  }

  return { ...permissions, [resource]: next }
}

/** Cycle to the next access level (none → read → write → full → none). */
export function cycleAccessLevel(current: AccessLevel, resource: Resource): AccessLevel {
  if (UPDATE_ONLY_RESOURCES.has(resource)) {
    return current === "none" ? "full" : "none"
  }
  const levels: AccessLevel[] = ["none", "read", "write", "full"]
  return levels[(levels.indexOf(current) + 1) % levels.length]
}
