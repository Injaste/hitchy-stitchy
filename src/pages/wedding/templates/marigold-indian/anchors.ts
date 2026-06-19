import { Heart, CalendarHeart } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const marigoldIndianAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Events", icon: CalendarHeart, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--mg-border) bg-(--mg-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--mg-primary)",
    label: "text-(--mg-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--mg-card) text-(--mg-fg) border-(--mg-primary)/30",
    title: "font-bold text-(--mg-magenta)",
    description: "text-(--mg-muted-fg)",
    button: "bg-(--mg-primary) text-(--mg-on-primary) hover:bg-(--mg-primary-deep) transition-colors",
    buttonOutline: "border border-(--mg-primary)/40 text-(--mg-fg) hover:bg-(--mg-bg-2) transition-colors",
    iframe: "border border-(--mg-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
