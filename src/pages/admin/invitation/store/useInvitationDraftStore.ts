import { create } from "zustand"
import type { PublicEventConfig } from "@/pages/templates/types"
import type { EventInvitation, DetailsDraft, RSVPDraft } from "../types"
import type { Themes, ThemeConfig } from "../themes/types"

interface DraftState {
  serverInvitation: EventInvitation | null
  serverThemes: Themes[]

  detailsDraft: DetailsDraft | null
  rsvpDraft: RSVPDraft | null
  pageDraft: ThemeConfig | null

  selectedPageId: string | null

  setServerInvitation: (inv: EventInvitation | null) => void
  setServerThemes: (themes: Themes[]) => void
  setSelectedPageId: (id: string | null) => void

  setDetails: (draft: DetailsDraft) => void
  setRSVP: (draft: RSVPDraft) => void
  setPage: (draft: ThemeConfig) => void

  clearDetails: () => void
  clearRSVP: () => void
  clearPage: () => void
}

export const useInvitationDraftStore = create<DraftState>((set) => ({
  serverInvitation: null,
  serverThemes: [],

  detailsDraft: null,
  rsvpDraft: null,
  pageDraft: null,

  selectedPageId: null,

  setServerInvitation: (inv) => set({ serverInvitation: inv }),
  setServerThemes: (themes) => set((state) => {
    const next: Partial<DraftState> = { serverThemes: themes }
    if (!state.selectedPageId || !themes.some((t) => t.id === state.selectedPageId)) {
      const published = themes.find((t) => t.is_published)
      next.selectedPageId = published?.id ?? themes[0]?.id ?? null
    }
    return next
  }),
  setSelectedPageId: (id) => set({ selectedPageId: id, pageDraft: null }),

  setDetails: (draft) => set({ detailsDraft: draft }),
  setRSVP: (draft) => set({ rsvpDraft: draft }),
  setPage: (draft) => set({ pageDraft: draft }),

  clearDetails: () => set({ detailsDraft: null }),
  clearRSVP: () => set({ rsvpDraft: null }),
  clearPage: () => set({ pageDraft: null }),
}))

export function composeEventConfig(args: {
  invitation: EventInvitation | null
  page: Themes | null
  details: DetailsDraft | null
  rsvp: RSVPDraft | null
  pageDraft: ThemeConfig | null
}): PublicEventConfig | null {
  const { invitation: inv, page, details, rsvp, pageDraft } = args
  if (!inv) return null

  const pageConfig: ThemeConfig = pageDraft ?? page?.config ?? {}
  const themeSlug = pageConfig._theme_slug ?? page?.theme?.slug ?? null

  return {
    id: inv.id,
    event_id: inv.event_id,
    groom_name: details ? (details.groom_name || null) : inv.groom_name,
    bride_name: details ? (details.bride_name || null) : inv.bride_name,
    event_date: details ? (details.event_date || null) : inv.event_date,
    event_time_start: details ? (details.event_time_start || null) : inv.event_time_start,
    event_time_end: details ? (details.event_time_end || null) : inv.event_time_end,
    venue_name: details ? (details.venue_name || null) : inv.venue_name,
    venue_address: details ? (details.venue_address || null) : inv.venue_address,
    venue_map_embed_url: details ? (details.venue_map_embed_url || null) : inv.venue_map_embed_url,
    venue_map_link: details ? (details.venue_map_link || null) : inv.venue_map_link,
    rsvp_mode: rsvp?.rsvp_mode ?? inv.rsvp_mode,
    rsvp_deadline: rsvp ? (rsvp.rsvp_deadline || null) : inv.rsvp_deadline,
    max_guests: details ? details.max_guests : inv.max_guests,
    guest_count_min: details ? details.guest_count_min : inv.guest_count_min,
    guest_count_max: details ? details.guest_count_max : inv.guest_count_max,
    confirmation_message: details ? details.confirmation_message : inv.confirmation_message,
    config: {
      rsvp: rsvp?.config ?? inv.config.rsvp,
    },
    published_page: page
      ? { id: page.id, theme_slug: themeSlug, config: pageConfig }
      : null,
  }
}
