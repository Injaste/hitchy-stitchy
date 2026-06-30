/** Plan entitlements for the event, from get_bootstrap_context. UX gating only —
 *  the server (RLS + RPCs) is the real boundary. */
export interface PlanContext {
  /** Pinned plan version id, e.g. "solo_1_v1". */
  key: string;
  /** Logical tier, e.g. "solo_1". The ladder position comes from the catalog. */
  tier: string;
  /** Display brand label, e.g. "Starter" | "Plus". */
  name: string;
  /** ISO timestamp, or null = the event is pending payment (locked). */
  activatedAt: string | null;
  /** true when the event is over its effective countable limits (downgrade lock). */
  isOverPlanLimits: boolean;
  /** Countable caps, keyed by cap field (the meters + the upgrade diff). */
  limits: Record<import("./plan/plan-config").PlanCap, number>;
  /** Per-feature access — a map keyed by feature (DB-driven; drives canUseFeature). */
  features: Record<import("./plan/plan-config").PlanFeature, boolean>;
  /** Current usage for meters (guests = active, non-cancelled). */
  usage: {
    days: number;
    guests: number;
    members: number;
    pages: number;
    timeline_items: number;
    tasks: number;
  };
}

export interface AdminBootstrapContext {
  slug: string;
  eventId: string;
  eventName: string;
  dateStart: string; // "yyyy-MM-dd"
  dateEnd: string; // "yyyy-MM-dd"
  memberId: string;
  memberDisplayName: string;
  memberAccessGroupId: string;
  memberAccessGroupName: string;
  /** true when event_members.is_root = true (bypasses all permission checks) */
  isRoot: boolean;
  /** Permissions jsonb from the member's access group — flat: { resource: "none" | "read" | "full" } */
  permissions: Record<string, import("./access/types").AccessLevel>;
  /** Free-text personal role/title, e.g. "Maid of Honor" */
  memberRole: string | null;
  /** Couple identity flags from event_members */
  isBride: boolean;
  isGroom: boolean;
  /** Shorthand: isRoot or is a couple member */
  isSuperAdmin: boolean;
  /** Plan entitlements for this event (UX gating only). */
  plan: PlanContext;
  /** The live tier ladder (DB-driven, ordered by rank) — drives upgrade paths. */
  catalog: import("./plan/plan-config").PlanTierRow[];
}

export const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
