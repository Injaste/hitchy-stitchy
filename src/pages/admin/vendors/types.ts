import { z } from "zod";

// Vendor CRM — a couple-side directory of who they hired (photographer, banquet,
// florist, emcee…). The vendor is a *contact card*; money lives in Budget and
// correlates by vendor_id, so there are no cost fields here. Super-admin only.
//
// MOCKUP: shape is still being confirmed — see docs/todo/mvp-phase-6-vendor-
// management.md. `category` is a plain string (known ones get an icon; unknown
// falls back), kept loose until we lock free-text vs enum.

export interface Vendor {
  id: string;
  event_id: string;
  name: string;
  category: string;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
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
  contact_phone: optionalText(60, "Phone is too long"),
  contact_email: z
    .string()
    .max(200, "Email is too long")
    .transform((v) => v.trim())
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "That doesn't look like an email",
    })
    .transform((v) => (v ? v : null)),
  notes: optionalText(1000, "Notes are too long"),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

export interface CreateVendorPayload extends VendorFormValues {}

export interface UpdateVendorPayload extends VendorFormValues {
  event_id: string;
  id: string;
}
