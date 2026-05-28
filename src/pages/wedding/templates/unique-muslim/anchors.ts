import { CalendarDays, MapPin, Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const uniqueMuslimAnchors: AnchorThemeConfig = {
  items: [
    { id: "date", label: "Date", icon: CalendarDays, target: "#date" },
    { id: "map", label: "Map", icon: MapPin, target: "#map", when: (c) => !!(c.venue_map_embed_url || c.venue_map_link) },
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--um-primary)/10 bg-(--um-card)/60 backdrop-blur-md",
    icon: "text-(--um-primary)",
    label: "text-(--um-fg)/60",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
