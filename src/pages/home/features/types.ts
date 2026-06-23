// ── Member ─────────────────────────────────────────────────────────────────

export type MemberStatusLabel = "active" | "pending" | "expired" | "frozen";

export interface AccessGroup {
  id: string;
  event_id: string;
  name: string;
  permissions: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  event_id: string;
  access_group_id: string;
  display_name: string;
  is_root: boolean;
  role: string | null;
  is_bride: boolean;
  is_groom: boolean;
  notes: string | null;
  invited_by: string | null;
  frozen_at: string | null;
  invited_at: string | null;
  joined_at: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  created_at: string;
  updated_at: string;
  preferences: Record<string, unknown>;
  accessGroup: AccessGroup | null;
}

// ── Task ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  event_id: string;
  created_by: string;
  title: string;
  details: string | null;
  label: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  position: number;
  assignees: string[];
  due_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Timeline ───────────────────────────────────────────────────────────────

export interface Timeline {
  id: string;
  event_id: string;
  day: string;
  segment_id: string;
  label: string | null;
  time_start: string;
  time_end: string | null;
  title: string;
  details: string | null;
  assignees: string[];
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export type CardLifecycle = "start" | "end" | "done" | null;

// ── Budget ─────────────────────────────────────────────────────────────────

export type ExpenseStatus = "paid" | "partial" | "unpaid";

export interface Expense {
  id: string;
  event_id: string;
  budget_id: string;
  item: string;
  vendor_name: string | null;
  payer: string | null;
  amount: number;
  paid: number;
  due_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  budgetTotal: number | null;
  spent: number;
  paid: number;
  remaining: number | null;
  outstanding: number;
  dueSoon: number;
  spentPct: number;
  paidPct: number;
}

// ── Gifts ──────────────────────────────────────────────────────────────────

export type GiftMethod = "envelope" | "cash" | "transfer" | "others";

export interface Gift {
  id: string;
  event_id: string;
  given_by: string;
  amount: number;
  method: GiftMethod;
  notes: string | null;
  day_id: string;
  created_at: string;
  updated_at: string;
}

// ── Guests ─────────────────────────────────────────────────────────────────

export type GuestStatus = "pending" | "confirmed" | "cancelled";

export interface Guest {
  id: string;
  event_id: string;
  invitation_id: string | null;
  name: string;
  phone: string | null;
  guest_count: number;
  message: string | null;
  status: GuestStatus;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  updated_at: string;
}

export const STATUS_LABELS: Record<GuestStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

// ── Invitation ─────────────────────────────────────────────────────────────

export interface RSVPFieldConfig {
  visible: boolean;
  required: boolean;
}

export interface RSVPSectionConfig {
  fields: {
    message: RSVPFieldConfig;
  };
  messages?: {
    deadline_closed?: string | null;
    invite_message?: string | null;
  };
}
