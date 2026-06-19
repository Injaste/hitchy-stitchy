import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const peonyChineseAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--pn-border) bg-(--pn-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--pn-primary)",
    label: "text-(--pn-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--pn-card) text-(--pn-fg) border-(--pn-primary)/25",
    title: "italic text-(--pn-primary) font-medium",
    description: "text-(--pn-muted-fg)",
    button: "bg-(--pn-primary) text-(--pn-on-primary) hover:bg-(--pn-primary-deep) transition-colors",
    buttonOutline: "border border-(--pn-primary)/30 text-(--pn-fg) hover:bg-(--pn-bg-2) transition-colors",
    iframe: "border border-(--pn-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
