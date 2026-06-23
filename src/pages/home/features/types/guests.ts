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
