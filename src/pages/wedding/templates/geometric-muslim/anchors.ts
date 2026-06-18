import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const geometricMuslimAnchors: AnchorThemeConfig = {
  // Scroll anchors only — date (calendar) + map are injected by the engine (AnchorDock).
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-t-2 border-(--gm-primary)/30 bg-(--gm-bg-2)/95 backdrop-blur-md rounded-none",
    icon: "text-(--gm-primary)/80",
    label: "text-(--gm-muted-fg) uppercase tracking-[0.15em] text-3xs",
  },
  drawer: {
    content: "bg-(--gm-bg-2) text-(--gm-fg) border-(--gm-primary)/30",
    title: "italic text-(--gm-gold-soft) font-bold",
    description: "text-(--gm-muted-fg)",
    button: "bg-(--gm-primary) text-(--gm-primary-fg) hover:bg-(--gm-primary)/90 transition-colors",
    buttonOutline: "border border-(--gm-primary)/40 text-(--gm-fg) hover:bg-(--gm-primary)/10 transition-colors",
    iframe: "border border-(--gm-primary)/20",
  },
  labels: {
    ariaLabel: "Wedding page navigation",
  },
}
