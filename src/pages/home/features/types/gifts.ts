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
