import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const zellijMuslimAnchors: AnchorThemeConfig = {
  // Scroll anchors only — date (calendar) + map are injected by the engine (AnchorDock).
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--zj-terracotta)/20 bg-(--zj-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--zj-primary)",
    label: "text-(--zj-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--zj-card) text-(--zj-fg) border-(--zj-primary)/30",
    title: "italic text-(--zj-primary) font-medium",
    description: "text-(--zj-muted-fg)",
    button: "bg-(--zj-primary) text-(--zj-on-primary) hover:bg-(--zj-primary-deep) transition-colors",
    buttonOutline: "border-2 border-(--zj-teal)/40 text-(--zj-fg) hover:bg-(--zj-bg-2) transition-colors",
    iframe: "border border-(--zj-primary)/25",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
