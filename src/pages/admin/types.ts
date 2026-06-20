/** Plan entitlements for the event, from get_bootstrap_context. UX gating only —
 *  the server (RLS + RPCs) is the real boundary. */
export interface PlanContext {
  /** Pinned plan version id, e.g. "free" | "pro" | "pro_v2". */
  key: string;
  /** Logical tier — "free" | "pro". Use this for "is Pro" checks, not `key`. */
  tier: string;
  /** Display label, e.g. "Free" | "Pro". */
  name: string;
  /** ISO timestamp, or null = the event is pending payment (locked). */
  activatedAt: string | null;
  /** true when the event is over its effective countable limits (downgrade lock). */
  isOverPlanLimits: boolean;
  limits: {
    maxDays: number;
    maxSegmentsPerDay: number;
    maxInvitationPages: number;
    maxGuests: number;
    maxMembers: number;
    canUseBudget: boolean;
    canUseGifts: boolean;
    canRemoveBranding: boolean;
  };
  /** Current usage for meters (guests = active, non-cancelled). */
  usage: {
    days: number;
    guests: number;
    members: number;
    pages: number;
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
}

export const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
