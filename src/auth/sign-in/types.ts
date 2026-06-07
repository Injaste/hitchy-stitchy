import { z } from "zod"

export interface LoginCredentials {
  email: string
  password: string
}

export const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export type SignInFormValues = z.infer<typeof signInSchema>
