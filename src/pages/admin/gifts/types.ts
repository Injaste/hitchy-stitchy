import { z } from "zod";

// Gift Envelopes — a per-day ledger of cash gifts (ang bao / sampul duit /
// shagun). MVP: who gave, how much, how it arrived, which day. Super-admin only.

export type GiftMethod = "envelope" | "cash" | "transfer" | "others";

export interface Gift {
  id: string;
  event_id: string;
  given_by: string;
  amount: number;
  method: GiftMethod;
  notes: string | null;
  /** The event_day this gift was received on (NOT NULL; create_gift resolves a
   *  null pick to the event's earliest day). */
  day_id: string;
  created_at: string;
  updated_at: string;
}

export const giftFormSchema = z.object({
  given_by: z.string().min(1, "Who gave this?").max(200, "Name is too long"),
  amount: z.coerce
    .number()
    .min(0, "Can't be negative")
    .max(99_999_999, "Amount is too high"),
  method: z.enum(["envelope", "cash", "transfer", "others"]),
  notes: z
    .string()
    .max(1000, "Notes are too long")
    .transform((v) => (v.trim() ? v.trim() : null)),
  /** Selected day — always a real day (the picker defaults to one; never null). */
  day_id: z.string().min(1, "Pick a day"),
});

export type GiftFormValues = z.infer<typeof giftFormSchema>;

export interface CreateGiftPayload extends GiftFormValues {}

export interface UpdateGiftPayload extends GiftFormValues {
  event_id: string;
  id: string;
}
