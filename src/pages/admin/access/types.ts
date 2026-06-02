// ── Access Group ──────────────────────────────────────────────────────────────

export interface AccessGroup {
  id: string;
  event_id: string;
  name: string;
  /** Nested permissions jsonb: { resource: { action: bool } } */
  permissions: Record<string, Record<string, boolean>>;
  created_at: string;
  updated_at: string;
}

export interface CreateAccessGroupPayload {
  event_id: string;
  name: string;
}

export interface UpdateAccessGroupPayload {
  event_id: string;
  id: string;
  name?: string;
  permissions?: Record<string, Record<string, boolean>>;
}

export interface DeleteAccessGroupPayload {
  event_id: string;
  id: string;
  name: string;
}

// ── Access config ─────────────────────────────────────────────────────────────

export type AccessLevel = "full" | "write" | "read" | "none";

export type Resource =
  | "timeline"
  | "tasks"
  | "tasks.archive"
  | "members"
  | "members.freeze"
  | "vendors"
  | "guests"
  | "invitation"
  | "themes"
  | "events"
  | "announcements"
  | "pages";

export interface ResourcePermission {
  resource: Resource;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface ResourceGroup {
  label: string;
  resources: Resource[];
}

export const RESOURCE_HINTS: Partial<Record<Resource, string>> = {
  tasks: "Managing other members' tasks",
};

export const RESOURCE_LABELS: Record<Resource, string> = {
  timeline: "Timeline",
  tasks: "Tasks",
  "tasks.archive": "Archive Tasks",
  members: "Team Members",
  "members.freeze": "Freeze Members",
  vendors: "Vendors",
  guests: "Guest RSVPs",
  invitation: "Invitation",
  themes: "Invitation Themes",
  events: "Event Details",
  announcements: "Announcements",
  pages: "Custom Pages",
};

export const RESOURCE_GROUPS: ResourceGroup[] = [
  { label: "Operations", resources: ["timeline", "tasks", "tasks.archive"] },
  { label: "Team", resources: ["members", "members.freeze"] },
  { label: "Guests", resources: ["guests", "invitation", "themes"] },
  { label: "Content", resources: ["announcements", "vendors", "pages"] },
  { label: "Event", resources: ["events"] },
];

export const ALL_RESOURCES: Resource[] = RESOURCE_GROUPS.flatMap(
  (g) => g.resources,
);

// Resources where only `can_update` is meaningful.
const UPDATE_ONLY_RESOURCES = new Set<Resource>([
  "members.freeze",
  "tasks.archive",
]);

export function deriveAccessLevel(
  perm: ResourcePermission | undefined,
  resource?: Resource,
): AccessLevel {
  if (!perm) return "none";
  const { can_read, can_create, can_update, can_delete } = perm;
  if (resource && UPDATE_ONLY_RESOURCES.has(resource) && can_update)
    return "full";
  if (can_create && can_update && can_delete) return "full";
  if (can_create || can_update || can_delete) return "write";
  if (can_read) return "read";
  return "none";
}

/**
 * Expand a nested permissions jsonb entry into a ResourcePermission struct.
 * DB shape: { "tasks": { "create": true, "read": false, ... } }
 */
export function getResourcePermission(
  permissions: Record<string, Record<string, boolean>>,
  resource: Resource,
): ResourcePermission {
  const r = permissions[resource] ?? {};
  return {
    resource,
    can_read: r["read"] ?? false,
    can_create: r["create"] ?? false,
    can_update: r["update"] ?? false,
    can_delete: r["delete"] ?? false,
  };
}

/** Apply an access level back to the nested permissions object. */
export function applyAccessLevel(
  permissions: Record<string, Record<string, boolean>>,
  resource: Resource,
  level: AccessLevel,
): Record<string, Record<string, boolean>> {
  const isUpdateOnly = UPDATE_ONLY_RESOURCES.has(resource);
  const current = permissions[resource] ?? {};

  let next: Record<string, boolean>;
  if (isUpdateOnly) {
    next = { ...current, update: level === "full" };
  } else {
    next = {
      ...current,
      read: level !== "none",
      create: level === "write" || level === "full",
      update: level === "write" || level === "full",
      delete: level === "full",
    };
  }

  return { ...permissions, [resource]: next };
}

/** Cycle to the next access level (none → read → write → full → none). */
export function cycleAccessLevel(
  current: AccessLevel,
  resource: Resource,
): AccessLevel {
  if (UPDATE_ONLY_RESOURCES.has(resource)) {
    return current === "none" ? "full" : "none";
  }
  const levels: AccessLevel[] = ["none", "read", "write", "full"];
  return levels[(levels.indexOf(current) + 1) % levels.length];
}
