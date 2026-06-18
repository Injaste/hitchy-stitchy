import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const royalMuslimAnchors: AnchorThemeConfig = {
  // Scroll anchors only — date (calendar) + map are injected by the engine (AnchorDock).
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--ry-gold)/30 bg-(--ry-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--ry-burgundy)",
    label: "text-(--ry-muted-fg) uppercase tracking-[0.18em] text-3xs",
  },
  drawer: {
    content: "bg-(--ry-card) text-(--ry-fg) border-(--ry-gold)/50",
    title: "italic text-(--ry-burgundy) font-medium",
    description: "text-(--ry-muted-fg)",
    button: "bg-(--ry-burgundy) text-(--ry-on-burgundy) hover:bg-(--ry-burgundy-deep) transition-colors",
    buttonOutline: "border border-(--ry-gold)/50 text-(--ry-fg) hover:bg-(--ry-bg-2) transition-colors",
    iframe: "border border-(--ry-gold)/30",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
