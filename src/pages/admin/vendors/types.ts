import { z } from "zod";

// Vendor CRM — a couple-side directory of who they hired (photographer, banquet,
// florist, emcee…). The vendor is a *contact card*; money lives in Budget and
// correlates by vendor_id, so there are no cost fields here. Super-admin only.
//
// Mirrors event_vendors [20260717000001]. `category` is a plain string: the FE
// renders a known SG set and falls back for anything else (categoryMeta), so
// loosening it to free-text later costs nothing. `phone` is E.164.

export interface Vendor {
  id: string;
  event_id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
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
  phone: optionalText(60, "Phone is too long"),
  email: z
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
