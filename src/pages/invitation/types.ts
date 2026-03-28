import { z } from "zod";

export const rsvpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(99, "Name is too long"),
  phoneNumber: z
    .string()
    .length(8, "Must be exactly 8 digits")
    .regex(/^[89]\d{7}$/, "Must be a valid SG number"),
  guestsCount: z.number().min(1).max(10, "Too many guests... please keep within 10"),
});

export type RSVPFormData = z.infer<typeof rsvpSchema>;