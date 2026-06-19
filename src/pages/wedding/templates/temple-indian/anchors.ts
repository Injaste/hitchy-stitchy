import { Heart, Landmark } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const templeIndianAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Muhurtham", icon: Landmark, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--tp-border) bg-(--tp-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--tp-primary)",
    label: "text-(--tp-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--tp-card) text-(--tp-fg) border-(--tp-primary)/30",
    title: "text-(--tp-primary) font-medium",
    description: "text-(--tp-muted-fg)",
    button: "bg-(--tp-primary) text-(--tp-on-primary) hover:bg-(--tp-primary-deep) transition-colors",
    buttonOutline: "border border-(--tp-primary)/40 text-(--tp-fg) hover:bg-(--tp-bg-2) transition-colors",
    iframe: "border border-(--tp-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
