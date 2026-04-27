import { z } from "zod"
import type { RoleCategory } from "../types"

export type { RoleCategory }

export interface Role {
  id: string
  event_id: string
  name: string
  short_name: string
  category: RoleCategory
  description: string | null
  created_at: string
  updated_at: string
}

export const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(60, "Name is too long"),
  short_name: z
    .string()
    .min(1, "Short name is required")
    .max(10, "Short name is too long"),
  category: z.enum(["root", "admin", "general"]),
  description: z
    .string()
    .max(500, "Description is too long")
    .transform((v) => v || null),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>

export interface CreateRolePayload {
  event_id: string
  name: string
  short_name: string
  category: RoleCategory
  description: string | null
}

export interface UpdateRolePayload {
  id: string
  name?: string
  short_name?: string
  category?: RoleCategory
  description?: string | null
}

export const CATEGORY_LABELS: Record<RoleCategory, string> = {
  root: "Root",
  admin: "Admin",
  general: "General",
}
