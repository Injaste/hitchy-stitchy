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
}

export const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
