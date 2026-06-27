import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarDays, MapPin } from "lucide-react"

import type { PublicEventConfig } from "@/pages/wedding/types"
import AnchorBar from "./AnchorBar"
import CalendarDrawer from "./CalendarDrawer"
import MapDrawer from "./MapDrawer"
import { getWeddingDateTime } from "./calendar"
import { deriveMapEmbedUrl } from "./map"
import type {
  AnchorClassNames,
  AnchorDrawerClassNames,
  AnchorItemConfig,
  AnchorLabels,
} from "./types"

interface AnchorDockProps {
  ready: boolean
  eventConfig: PublicEventConfig
  /** The template's own scroll anchors (e.g. Date, Itinerary, RSVP). */
  scrollItems: AnchorItemConfig[]
  classNames: AnchorClassNames
  drawerClassNames: AnchorDrawerClassNames
  labels: AnchorLabels
  /** Calendar event details (title + optional location). */
  calendar: { title: string; location?: string | null }
  /** Map details — an embed URL and/or a shareable maps link, plus an address. */
  map: { embedUrl?: string | null; link?: string | null; address?: string | null }
}

// Engine-injected anchor dock: every template gets calendar + map as anchor
// drawer actions (the rule), so authors never hand-roll on-page buttons. The
// drawers render inside the template root, inheriting its scoped palette.
const AnchorDock = ({
  ready,
  eventConfig,
  scrollItems,
  classNames,
  drawerClassNames,
  labels,
  calendar,
  map,
}: AnchorDockProps) => {
  const [calOpen, setCalOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)

  // react-frame-component runs component code in the parent window's JS
  // context, so `document` refers to the admin page — not the iframe's
  // document. If hero is not found we're in a preview iframe; default to
  // showing the anchor instead of waiting for an observer that never fires.
  const [heroMostlyVisible, setHeroMostlyVisible] = useState(true)
  useEffect(() => {
    const hero = document.getElementById("hero")
    if (!hero) {
      setHeroMostlyVisible(false)
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => setHeroMostlyVisible(e.isIntersecting),
      { threshold: 0.8 },
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  const start = getWeddingDateTime(eventConfig.event_date, eventConfig.event_time_start)
  const end = getWeddingDateTime(eventConfig.event_date, eventConfig.event_time_end)
  const calendarEnabled = !!start

  const mapEmbed = map.embedUrl || deriveMapEmbedUrl(map.link)
  const mapEnabled = !!(mapEmbed || map.link)

  // Date (the calendar drawer) leads; map sits just before the RSVP call-to-action,
  // which stays last. Result: Date · …scroll items… · Map · RSVP.
  const calItem: AnchorItemConfig[] = calendarEnabled
    ? [{ id: "calendar", label: labels.calendar ?? "Date", icon: CalendarDays, target: "action:calendar" }]
    : []
  const mapItem: AnchorItemConfig[] = mapEnabled
    ? [{ id: "map", label: labels.map ?? "Map", icon: MapPin, target: "action:map" }]
    : []
  const base = [...calItem, ...scrollItems]
  const rsvpIdx = base.findIndex((i) => i.id === "rsvp")
  const items =
    rsvpIdx === -1
      ? [...base, ...mapItem]
      : [...base.slice(0, rsvpIdx), ...mapItem, ...base.slice(rsvpIdx)]

  const handleAction = (name: string) => {
    if (name === "map") setMapOpen(true)
    if (name === "calendar") setCalOpen(true)
  }

  return (
    <>
      <AnchorBar
        visible={ready && !heroMostlyVisible}
        items={items}
        classNames={classNames}
        labels={labels}
        onAction={handleAction}
      />

      {calendarEnabled && start && (
        <CalendarDrawer
          open={calOpen}
          onOpenChange={setCalOpen}
          title={calendar.title}
          start={start}
          end={end}
          location={calendar.location}
          dateLabel={format(start, "EEEE, d MMMM yyyy · h:mm a")}
          classNames={drawerClassNames}
        />
      )}

      {mapEnabled && (
        <MapDrawer
          open={mapOpen}
          onOpenChange={setMapOpen}
          embedUrl={mapEmbed}
          link={map.link}
          address={map.address}
          classNames={drawerClassNames}
        />
      )}
    </>
  )
}

export default AnchorDock
