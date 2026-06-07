import { z } from "zod"

export interface ResetPasswordCredentials {
  email: string
}

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
