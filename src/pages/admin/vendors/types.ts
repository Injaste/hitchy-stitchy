import { z } from "zod";

import { isValidPhone } from "@/lib/phone";

// Vendor CRM — a directory of who they hired (photographer, banquet, florist,
// emcee…). The vendor is a *contact card*; money lives in Budget and correlates
// by vendor_id, so there are no cost fields here. A delegated resource (Admin
// manages fully, Team none), gated on the Pro plan.
//
// Mirrors event_vendors. `category` is a plain string: the FE renders a known SG
// set and falls back for anything else (categoryMeta), so loosening it to
// free-text later costs nothing. `phone` is E.164. `day_ids` are the event days
// this vendor works — none / one / many (a photographer on both days is one
// contact with two day ids) [20260718000009].

export interface Vendor {
  id: string;
  event_id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  day_ids: string[];
  created_at: string;
  updated_at: string;
}

const optionalText = (max: number, tooLong: string) =>
  z
    .string()
    .max(max, tooLong)
    .transform((v) => (v.trim() ? v.trim() : null));

export const vendorFormSchema = z.object({
  name: z.string().min(1, "Give the vendor a name").max(200, "Name is too long"),
  category: z.string().min(1, "Pick a category"),
  // The control hands us E.164, but it can still compose nonsense: the field
  // pre-fills "+65 ", so pasting a full "+60 12-345 6789" after the cursor
  // yields "+65 +60 12-345 6789" -> the first code wins and the rest becomes the
  // national part -> +6560123456789. That's E.164-*shaped* and even a plausible
  // *length* for SG, so only a real validity check rejects it. Left unguarded it
  // saves silently and fails on the day, when someone taps Call.
  phone: optionalText(60, "Phone is too long").refine(
    (v) => !v || isValidPhone(v),
    { message: "That doesn't look like a valid number" },
  ),
  email: z
    .string()
    .max(200, "Email is too long")
    .transform((v) => v.trim())
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "That doesn't look like an email",
    })
    .transform((v) => (v ? v : null)),
  notes: optionalText(1000, "Notes are too long"),
  // Which event days this vendor works. Validated server-side against the event's
  // days; here it's just the selected set (may be empty).
  day_ids: z.array(z.string()).default([]),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

export interface CreateVendorPayload extends VendorFormValues {}

export interface UpdateVendorPayload extends VendorFormValues {
  event_id: string;
  id: string;
}
