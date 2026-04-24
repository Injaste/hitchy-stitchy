import { create } from "zustand"
import type { PublicEventConfig } from "@/pages/templates/types"
import type { ThemePageConfig } from "@/pages/templates/themes"
import type {
  EventInvitation,
  EventPage,
  AppearanceConfig,
  RSVPSectionConfig,
  RSVPMode,
} from "../types"

type DetailsDraft = {
  groom_name: string
  bride_name: string
  event_date: string
  event_time_start: string
  event_time_end: string
  venue_name: string
  venue_address: string
  venue_map_link: string
  venue_map_embed_url: string
}

type RSVPDraft = {
  rsvp_mode: RSVPMode
  rsvp_deadline: string
  config: RSVPSectionConfig
}

interface DraftState {
  serverInvitation: EventInvitation | null
  serverPages: EventPage[]

  detailsDraft: DetailsDraft | null
  appearanceDraft: AppearanceConfig | null
  rsvpDraft: RSVPDraft | null
  pageDraft: ThemePageConfig | null

  selectedPageId: string | null

  setServerInvitation: (inv: EventInvitation | null) => void
  setServerPages: (pages: EventPage[]) => void
  setSelectedPageId: (id: string | null) => void

  setDetails: (draft: DetailsDraft) => void
  setAppearance: (draft: AppearanceConfig) => void
  setRSVP: (draft: RSVPDraft) => void
  setPage: (draft: ThemePageConfig) => void

  clearDetails: () => void
  clearAppearance: () => void
  clearRSVP: () => void
  clearPage: () => void
}

export const useInvitationDraftStore = create<DraftState>((set) => ({
  serverInvitation: null,
  serverPages: [],

  detailsDraft: null,
  appearanceDraft: null,
  rsvpDraft: null,
  pageDraft: null,

  selectedPageId: null,

  setServerInvitation: (inv) => set({ serverInvitation: inv }),
  setServerPages: (pages) => set((state) => {
    const next: Partial<DraftState> = { serverPages: pages }
    if (!state.selectedPageId || !pages.some((p) => p.id === state.selectedPageId)) {
      const published = pages.find((p) => p.is_published)
      next.selectedPageId = published?.id ?? pages[0]?.id ?? null
    }
    return next
  }),
  setSelectedPageId: (id) => set({ selectedPageId: id, pageDraft: null }),

  setDetails: (draft) => set({ detailsDraft: draft }),
  setAppearance: (draft) => set({ appearanceDraft: draft }),
  setRSVP: (draft) => set({ rsvpDraft: draft }),
  setPage: (draft) => set({ pageDraft: draft }),

  clearDetails: () => set({ detailsDraft: null }),
  clearAppearance: () => set({ appearanceDraft: null }),
  clearRSVP: () => set({ rsvpDraft: null }),
  clearPage: () => set({ pageDraft: null }),
}))

export function composeEventConfig(args: {
  invitation: EventInvitation | null
  page: EventPage | null
  details: DetailsDraft | null
  appearance: AppearanceConfig | null
  rsvp: RSVPDraft | null
  pageDraft: ThemePageConfig | null
}): PublicEventConfig | null {
  const { invitation: inv, page, details, appearance, rsvp, pageDraft } = args
  if (!inv) return null

  const pageConfig: ThemePageConfig = pageDraft ?? page?.config ?? {}
  const appearanceValue = appearance ?? inv.config.appearance
  const rsvpMode = (rsvp?.rsvp_mode ?? inv.rsvp_mode) as PublicEventConfig["rsvp_mode"]
  const rsvpDeadline = rsvp
    ? (rsvp.rsvp_deadline || null)
    : inv.rsvp_deadline
  const rsvpConfig = rsvp?.config ?? inv.config.rsvp
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
    rsvp_mode: rsvpMode,
    rsvp_deadline: rsvpDeadline,
    config: {
      rsvp: rsvpConfig,
      appearance: appearanceValue ?? undefined,
    },
    published_page: page
      ? { id: page.id, theme_slug: themeSlug, config: pageConfig }
      : null,
  }
}
