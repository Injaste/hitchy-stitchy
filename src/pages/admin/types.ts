export interface AdminBootstrapContext {
  slug: string;
  eventId: string;
  eventName: string;
  dateStart: string; // "yyyy-MM-dd"
  dateEnd: string; // "yyyy-MM-dd"
  memberId: string;
  memberDisplayName: string;
  memberRoleId: string;
  memberRoleName: string;
  /** true when event_members.is_root = true (bypasses all permission checks) */
  isRoot: boolean;
  /** Permissions jsonb from the member's role — nested: { resource: { action: bool } } */
  permissions: Record<string, Record<string, boolean>>;
  /** Free-text personal label, e.g. "Maid of Honor" */
  memberLabel: string | null;
  /** Couple identity flags from event_members */
  isBride: boolean;
  isGroom: boolean;
  /** Shorthand: isRoot or is a couple member */
  isSuperAdmin: boolean;
}

export const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
