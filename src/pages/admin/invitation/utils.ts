import type { Invitation, Theme } from "./types"
import type { ThemeConfig } from "@/pages/wedding/templates/types"
import type { PublicEventConfig } from "@/pages/wedding/types"

export function mapToPublicEventConfig(
  inv: Invitation,
  theme: Theme | null,
): PublicEventConfig {
  const slug = (theme?.config?.slug as string | null | undefined) ?? null
  return {
    id: inv.id,
    event_id: inv.event_id,
    event_date: inv.event_date,
    event_time_start: inv.event_time_start,
    event_time_end: inv.event_time_end,
    rsvp_mode: inv.rsvp_mode,
    rsvp_deadline: inv.rsvp_deadline,
    max_guests: inv.max_guests,
    guest_count_min: inv.guest_count_min,
    guest_count_max: inv.guest_count_max,
    confirmation_message: inv.confirmation_message,
    config: inv.config,
    published_page: theme
      ? {
        id: theme.id,
        theme_slug: slug,
        config: theme.config ?? ({ slug: null } as ThemeConfig),
      }
      : null,
  }
}

export function composeEventConfig(
  inv: Invitation,
  theme: Theme | null,
  themeDraft: ThemeConfig | null,
): PublicEventConfig {
  const mergedTheme: Theme | null =
    theme && themeDraft ? { ...theme, config: themeDraft } : theme
  return mapToPublicEventConfig(inv, mergedTheme)
}
