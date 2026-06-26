import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const creamClassicAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--cl-primary)/15 bg-(--cl-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--cl-primary)",
    label: "text-(--cl-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--cl-card) text-(--cl-fg) border-(--cl-accent)/50",
    title: "italic text-(--cl-primary) font-medium",
    description: "text-(--cl-muted-fg)",
    button: "bg-(--cl-primary) text-(--cl-on-primary) hover:bg-(--cl-primary-deep) transition-colors",
    buttonOutline: "border border-(--cl-accent)/50 text-(--cl-fg) hover:bg-(--cl-bg-2) transition-colors",
    iframe: "border border-(--cl-accent)/30",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
