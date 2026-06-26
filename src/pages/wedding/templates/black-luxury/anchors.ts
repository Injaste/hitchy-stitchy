import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const blackLuxuryAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--bl-primary)/15 bg-(--bl-card)/70 backdrop-blur-sm shadow-sm",
    icon: "text-(--bl-primary)",
    label: "text-(--bl-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--bl-card) text-(--bl-fg) border-(--bl-accent)/50",
    title: "italic text-(--bl-primary) font-medium",
    description: "text-(--bl-muted-fg)",
    button: "bg-(--bl-primary) text-(--bl-on-primary) hover:bg-(--bl-primary-deep) transition-colors",
    buttonOutline: "border border-(--bl-accent)/50 text-(--bl-fg) hover:bg-(--bl-bg-2) transition-colors",
    iframe: "border border-(--bl-accent)/30",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
