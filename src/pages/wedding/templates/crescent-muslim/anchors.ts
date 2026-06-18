import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const crescentMuslimAnchors: AnchorThemeConfig = {
  // Scroll anchors only — date (calendar) + map are injected by the engine (AnchorDock).
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--cm-border) bg-(--cm-card)/90 backdrop-blur-md shadow-sm",
    icon: "text-(--cm-accent)",
    label: "text-(--cm-muted-fg) tracking-wide",
  },
  drawer: {
    content: "bg-(--cm-card) text-(--cm-fg) border-(--cm-border)",
    title: "italic text-(--cm-fg) font-medium",
    description: "text-(--cm-muted-fg)",
    button: "bg-(--cm-accent) text-white hover:bg-(--cm-accent-deep) transition-colors",
    buttonOutline: "border border-(--cm-border) text-(--cm-fg) hover:bg-(--cm-bg-2) transition-colors",
    iframe: "border border-(--cm-border)",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
