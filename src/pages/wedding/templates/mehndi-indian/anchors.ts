import { Heart, ScrollText } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const mehndiIndianAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Ceremonies", icon: ScrollText, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--mh-border) bg-(--mh-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--mh-primary)",
    label: "text-(--mh-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--mh-card) text-(--mh-fg) border-(--mh-primary)/30",
    title: "text-(--mh-maroon) font-medium",
    description: "text-(--mh-muted-fg)",
    button: "bg-(--mh-primary) text-(--mh-on-primary) hover:bg-(--mh-primary-deep) transition-colors",
    buttonOutline: "border border-(--mh-primary)/40 text-(--mh-fg) hover:bg-(--mh-bg-2) transition-colors",
    iframe: "border border-(--mh-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
