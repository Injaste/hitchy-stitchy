import { Heart, ClipboardClock } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const porcelainChineseAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Itinerary", icon: ClipboardClock, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--pc-border) bg-(--pc-card)/92 backdrop-blur-md shadow-sm",
    icon: "text-(--pc-primary)",
    label: "text-(--pc-muted-fg) uppercase tracking-[0.16em] text-3xs",
  },
  drawer: {
    content: "bg-(--pc-card) text-(--pc-fg) border-(--pc-primary)/25",
    title: "italic text-(--pc-primary) font-medium",
    description: "text-(--pc-muted-fg)",
    button: "bg-(--pc-primary) text-(--pc-on-primary) hover:bg-(--pc-primary-deep) transition-colors",
    buttonOutline: "border border-(--pc-primary)/30 text-(--pc-fg) hover:bg-(--pc-bg-2) transition-colors",
    iframe: "border border-(--pc-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
