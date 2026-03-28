import { z } from "zod";
import type { RSVPFormConfig } from "@/pages/admin/features/settings/types";

export function buildRsvpSchema(config: RSVPFormConfig) {
  return z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(99, "Name is too long"),
    phoneNumber: config.fields.phone.visible
      ? config.fields.phone.required
        ? z.string().min(1, "Phone number is required")
        : z.string().optional()
      : z.string().optional(),
    guestsCount: config.fields.guestsCount.visible
      ? z
          .number()
          .min(config.guestMin, `Minimum ${config.guestMin} guest${config.guestMin !== 1 ? "s" : ""}`)
          .max(config.guestMax, `Maximum ${config.guestMax} guests`)
      : z.number().optional(),
  });
}

// Most permissive type — all fields optional at the type level
export type RSVPFormData = {
  name: string;
  phoneNumber?: string;
  guestsCount?: number;
};
