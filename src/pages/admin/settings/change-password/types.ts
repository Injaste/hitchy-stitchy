import { z } from "zod"

export interface ChangePasswordPayload {
  password: string
}

export const changePasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
})
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
