import { Heart, Crown } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const mughalIndianAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Programme", icon: Crown, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--mu-border) bg-(--mu-card)/92 backdrop-blur-md shadow-lg",
    icon: "text-(--mu-primary)",
    label: "text-(--mu-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--mu-card) text-(--mu-fg) border-(--mu-border)",
    title: "text-(--mu-primary) font-medium",
    description: "text-(--mu-muted-fg)",
    button: "bg-(--mu-primary) text-(--mu-on-primary) hover:bg-(--mu-primary-deep) transition-colors",
    buttonOutline: "border border-(--mu-border) text-(--mu-fg) hover:bg-(--mu-bg-2) transition-colors",
    iframe: "border border-(--mu-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
