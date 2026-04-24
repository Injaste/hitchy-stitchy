import type { CategoryPermissions } from "./types"

// TODO: replace with live Supabase query
export const mockPermissions: CategoryPermissions[] = [
  {
    category: "root",
    permissions: [
      { resource: "timeline", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "tasks", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "members", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "roles", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "vendors", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "rsvp", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "invitation", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "settings", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "events", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "announcements", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "pages", can_read: true, can_create: true, can_update: true, can_delete: true },
    ],
  },
  {
    category: "admin",
    permissions: [
      { resource: "timeline", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "tasks", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "members", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "roles", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "vendors", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "rsvp", can_read: true, can_create: false, can_update: true, can_delete: false },
      { resource: "invitation", can_read: true, can_create: false, can_update: true, can_delete: false },
      { resource: "settings", can_read: true, can_create: false, can_update: true, can_delete: false },
      { resource: "events", can_read: true, can_create: false, can_update: true, can_delete: false },
      { resource: "announcements", can_read: true, can_create: true, can_update: true, can_delete: true },
      { resource: "pages", can_read: true, can_create: true, can_update: true, can_delete: true },
    ],
  },
  {
    category: "couple_attendant",
    permissions: [
      { resource: "timeline", can_read: true, can_create: false, can_update: false, can_delete: false },
      { resource: "tasks", can_read: true, can_create: false, can_update: true, can_delete: false },
      { resource: "members", can_read: true, can_create: false, can_update: false, can_delete: false },
      { resource: "vendors", can_read: true, can_create: false, can_update: false, can_delete: false },
      { resource: "announcements", can_read: true, can_create: false, can_update: false, can_delete: false },
      { resource: "invitation", can_read: true, can_create: false, can_update: false, can_delete: false },
    ],
  },
  {
    category: "general",
    permissions: [
      { resource: "timeline", can_read: true, can_create: false, can_update: false, can_delete: false },
      { resource: "announcements", can_read: true, can_create: false, can_update: false, can_delete: false },
      { resource: "invitation", can_read: true, can_create: false, can_update: false, can_delete: false },
    ],
  },
]
