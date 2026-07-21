// ── Access Group ──────────────────────────────────────────────────────────────

/** Per-resource access level. `full` implies read; absence means `none`. */
export type AccessLevel = "none" | "read" | "full";

export interface AccessGroup {
  id: string;
  event_id: string;
  name: string;
  /** Flat permissions jsonb: { resource: "none" | "read" | "full" } */
  permissions: Record<string, AccessLevel>;
  created_at: string;
  updated_at: string;
}

// ── Resources ─────────────────────────────────────────────────────────────────

// Fixed, read-only access groups (Admin / Team) gate these. Member management
// also layers a capability rank — see lib/access/policy.ts.
export type Resource =
  | "timeline"
  | "tasks"
  | "guests"
  | "invitation"
  | "members"
  | "access"
  | "budget"
  | "gifts"
  | "vendors";

export interface ResourceGroup {
  label: string;
  resources: Resource[];
}

export const RESOURCE_LABELS: Record<Resource, string> = {
  timeline: "Timeline",
  tasks: "Tasks",
  guests: "Guest RSVPs",
  invitation: "Invitation",
  members: "Members",
  access: "Access",
  budget: "Budget",
  gifts: "Gifts",
  vendors: "Vendors",
};

export const RESOURCE_GROUPS: ResourceGroup[] = [
  { label: "Operations", resources: ["timeline", "tasks"] },
  { label: "Money", resources: ["budget", "gifts"] },
  { label: "Guests", resources: ["guests", "invitation"] },
  { label: "People", resources: ["members", "vendors", "access"] },
];

/** Read a resource's level off a (flat) permissions object. */
export function getLevel(
  permissions: Record<string, AccessLevel>,
  resource: Resource,
): AccessLevel {
  return permissions[resource] ?? "none";
}
