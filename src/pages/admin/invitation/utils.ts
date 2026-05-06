import type {
  DetailsDraft,
  Invitation,
  RSVPDraft,
} from "./types"
import type { ThemeConfig } from "@/pages/templates/themes/types"
import type { Theme } from "./types"
import type { PublicEventConfig } from "@/pages/templates/types"

export function mapToPublicEventConfig(
  inv: Invitation,
  theme: Theme | null,
): PublicEventConfig {
  const themeConfig: ThemeConfig = theme?.config ?? {}
  const themeSlug = themeConfig.slug ?? null

  return {
    id: inv.id,
    event_id: inv.event_id,
    groom_name: inv.groom_name,
    bride_name: inv.bride_name,
    event_date: inv.event_date,
    event_time_start: inv.event_time_start,
    event_time_end: inv.event_time_end,
    venue_name: inv.venue_name,
    venue_address: inv.venue_address,
    venue_map_embed_url: inv.venue_map_embed_url,
    venue_map_link: inv.venue_map_link,
    rsvp_mode: inv.rsvp_mode,
    rsvp_deadline: inv.rsvp_deadline,
    max_guests: inv.max_guests,
    guest_count_min: inv.guest_count_min,
    guest_count_max: inv.guest_count_max,
    confirmation_message: inv.confirmation_message,
    config: inv.config,
    published_page: theme
      ? { id: theme.id, theme_slug: themeSlug, config: themeConfig }
      : null,
  }
}

export function composeEventConfig(
  inv: Invitation,
  theme: Theme | null,
  details: DetailsDraft | null,
  rsvp: RSVPDraft | null,
  themeDraft: ThemeConfig | null,
): PublicEventConfig {
  const merged: Invitation = {
    ...inv,
    ...(details ?? {}),
    rsvp_mode: rsvp?.rsvp_mode ?? inv.rsvp_mode,
    rsvp_deadline: rsvp ? (rsvp.rsvp_deadline || null) : inv.rsvp_deadline,
    config: {
      rsvp: rsvp?.config ?? inv.config.rsvp,
    },
  }

  const mergedTheme: Theme | null = theme && themeDraft
    ? { ...theme, config: themeDraft }
    : theme

  return mapToPublicEventConfig(merged, mergedTheme)
}