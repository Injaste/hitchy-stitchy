import { z } from "zod"

/** Account-level profile (one per auth user). `name` is global — distinct from
 *  event_members.display_name, which is per-event. `email` comes from auth, not
 *  the profiles row, and is read-only here. */
export interface Profile {
  name: string | null
  email: string | null
  avatar_url: string | null
}

export const profileNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be less than 50 characters."),
})

export type ProfileNameFormValues = z.infer<typeof profileNameSchema>
