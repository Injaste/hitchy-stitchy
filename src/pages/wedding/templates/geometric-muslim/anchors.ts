import { CalendarDays, MapPin, Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const geometricMuslimAnchors: AnchorThemeConfig = {
  items: [
    { id: "date", label: "Date", icon: CalendarDays, target: "#date" },
    { id: "map", label: "Map", icon: MapPin, target: "#map", when: (c) => !!(c.venue_map_embed_url || c.venue_map_link) },
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-t-2 border-(--gm-primary)/30 bg-(--gm-bg-2)/95 backdrop-blur-md rounded-none",
    icon: "text-(--gm-primary)/80",
    label: "text-(--gm-muted-fg) uppercase tracking-[0.15em] text-3xs",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
