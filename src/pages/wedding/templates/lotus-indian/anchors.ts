import { Heart, CalendarDays } from "lucide-react"
import type { AnchorThemeConfig } from "@/pages/wedding/anchors"

export const lotusIndianAnchors: AnchorThemeConfig = {
  items: [
    { id: "itinerary", label: "Schedule", icon: CalendarDays, target: "#itinerary" },
    { id: "rsvp", label: "RSVP", icon: Heart, target: "#rsvp", scrollBlock: "start" },
  ],
  classNames: {
    bar: "border-(--lt-border) bg-(--lt-card)/90 backdrop-blur-md shadow-sm",
    icon: "text-(--lt-primary)",
    label: "text-(--lt-muted-fg) uppercase tracking-[0.18em] text-3xs",
  },
  drawer: {
    content: "bg-(--lt-card) text-(--lt-fg) border-(--lt-border)",
    title: "text-(--lt-primary) font-medium",
    description: "text-(--lt-muted-fg)",
    button: "bg-(--lt-primary) text-(--lt-on-primary) hover:bg-(--lt-primary-deep) transition-colors",
    buttonOutline: "border border-(--lt-border) text-(--lt-fg) hover:bg-(--lt-bg-2) transition-colors",
    iframe: "border border-(--lt-border)",
  },
  labels: { ariaLabel: "Wedding page navigation" },
}
