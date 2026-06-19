import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const imperialChineseAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-t border-(--im-gold)/30 bg-(--im-bg-2)/95 backdrop-blur-md",
    icon: "text-(--im-gold)",
    label: "text-(--im-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--im-card) text-(--im-fg) border-(--im-gold)/40",
    title: "italic text-(--im-gold-soft) font-medium",
    description: "text-(--im-muted-fg)",
    button: "bg-(--im-gold) text-(--im-on-primary) hover:bg-(--im-gold)/90 transition-colors",
    buttonOutline: "border border-(--im-gold)/40 text-(--im-fg) hover:bg-(--im-bg-2) transition-colors",
    iframe: "border border-(--im-gold)/25",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
