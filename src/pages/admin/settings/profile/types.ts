import { z } from "zod";

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
