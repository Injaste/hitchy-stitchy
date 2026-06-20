import { z } from "zod"

export interface ChangePasswordPayload {
  password: string
}

// Password strength is enforced by the PasswordChecklist + a disabled submit
// (isPasswordValid), not here — so there's no redundant field error. This only
// covers presence + the confirm match.
export const changePasswordSchema = z.object({
  password: z.string().min(1, "Please enter a new password"),
  confirm_password: z.string().min(1, "Please confirm your password"),
})
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
