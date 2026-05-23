import { CalendarDays, MapPin, Heart } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const uniqueMuslimAnchors: AnchorThemeConfig = {
  items: [
    { id: "date",  label: "Date",     icon: CalendarDays, target: "#date" },
    { id: "map",   label: "Map",      icon: MapPin,       target: "#map", when: (c) => !!(c.venue_map_embed_url || c.venue_map_link) },
    { id: "rsvp",  label: "RSVP",     icon: Heart,        target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-primary/10 bg-card/60 backdrop-blur-md",
    icon: "text-primary",
    label: "text-foreground/60",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
