import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const uniqueMuslimAnchors: AnchorThemeConfig = {
  // Scroll anchors only — date (calendar) + map are injected by the engine (AnchorDock).
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--um-primary)/10 bg-(--um-card)/60 backdrop-blur-md",
    icon: "text-(--um-primary)",
    label: "text-(--um-fg)/60",
  },
  drawer: {
    content: "bg-(--um-card) text-(--um-fg) border-(--um-primary)/20",
    title: "italic text-(--um-primary) font-bold",
    description: "text-(--um-muted-fg)",
    button: "bg-(--um-primary) text-(--um-primary-fg) hover:bg-(--um-primary)/90 transition-colors",
    buttonOutline: "border border-(--um-primary)/30 text-(--um-fg) hover:bg-(--um-primary)/10 transition-colors",
    iframe: "border border-(--um-primary)/10",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
