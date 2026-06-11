import type { SignupCredentials } from "./types"

export async function signupUser(_credentials: SignupCredentials): Promise<void> {
  // Sign-ups are closed for beta — throw so the form shows a waitlist message
  // instead of faking success. The real gate is also Supabase Auth → "Enable
  // signups" OFF. Invites work for existing accounts (login → claim); re-enabling
  // signup is a documented follow-up.
  throw new Error("Sign-ups are closed for now — please join the waitlist.")
}