import { z } from "zod"

export interface SignupCredentials {
  fullName: string
  email: string
  password: string
}

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
  agree_terms: z.boolean().refine((v) => v === true, {
    message: "Please agree to the Privacy Policy to continue",
  }),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export type SignUpFormValues = z.infer<typeof signUpSchema>