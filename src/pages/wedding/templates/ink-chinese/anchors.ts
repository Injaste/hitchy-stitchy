import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const inkChineseAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--ik-border) bg-(--ik-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--ik-ink)",
    label: "text-(--ik-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--ik-card) text-(--ik-fg) border-(--ik-border)",
    title: "italic text-(--ik-ink) font-medium",
    description: "text-(--ik-muted-fg)",
    button: "bg-(--ik-ink) text-(--ik-on-ink) hover:bg-(--ik-ink)/90 transition-colors",
    buttonOutline: "border border-(--ik-border) text-(--ik-fg) hover:bg-(--ik-bg-2) transition-colors",
    iframe: "border border-(--ik-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
