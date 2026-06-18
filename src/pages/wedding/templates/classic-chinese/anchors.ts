import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const classicChineseAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--cc-primary)/20 bg-(--cc-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--cc-primary)",
    label: "text-(--cc-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--cc-card) text-(--cc-fg) border-(--cc-gold)/50",
    title: "italic text-(--cc-primary) font-medium",
    description: "text-(--cc-muted-fg)",
    button: "bg-(--cc-primary) text-(--cc-on-primary) hover:bg-(--cc-primary-deep) transition-colors",
    buttonOutline: "border border-(--cc-gold)/50 text-(--cc-fg) hover:bg-(--cc-bg-2) transition-colors",
    iframe: "border border-(--cc-gold)/30",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
