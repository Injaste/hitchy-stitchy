import { format } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Shirt } from "lucide-react"
import type { PublicEventConfig } from "@/pages/invitation/types"
import { fadeUp } from "./animations"
import DetailsIntro from "./sections/DetailsIntro"
import DetailsBlessings from "./sections/DetailsBlessings"
import DetailsCards, { type DetailsCardItem } from "./sections/DetailsCards"
import DetailsMap from "./sections/DetailsMap"

const Details = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const appearance = eventConfig.config.appearance

  const sectionTitle = appearance?.section_title ?? "A Journey of Love"
  const invitationBody =
    appearance?.invitation_body ??
    "In the name of Allah, the Most Gracious, the Most Merciful. We invite you to witness the beginning of our forever. A day where two souls become one, guided by faith and bound by love."
  const blessingsName = appearance?.blessings_name ?? null
  const blessingsLabel = appearance?.blessings_label ?? null
  const attire = appearance?.attire ?? null

  const parts = eventConfig.event_date?.split("-").map(Number)
  const eventDate = parts ? new Date(parts[0], parts[1] - 1, parts[2]) : null

  const detailsList: DetailsCardItem[] = [
    ...(eventDate
      ? [{ icon: Calendar, title: "Date", detail: format(eventDate, "do MMMM yyyy"), sub: format(eventDate, "EEEE") }]
      : []),
    ...(eventConfig.event_time_start
      ? [{ icon: Clock, title: "Time", detail: eventConfig.event_time_start, sub: eventConfig.event_time_end ? `to ${eventConfig.event_time_end}` : "" }]
      : []),
    ...(eventConfig.venue_name
      ? [{ icon: MapPin, title: "Location", detail: eventConfig.venue_name, sub: eventConfig.venue_address ?? "" }]
      : []),
    ...(attire ? [{ icon: Shirt, title: "Attire", detail: attire, sub: "Dress code" }] : []),
  ]

  const googleCalendarUrl = eventDate
    ? "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(eventConfig.couple_names ?? "Wedding") +
      "&dates=" + encodeURIComponent(`${format(eventDate, "yyyyMMdd")}/${format(eventDate, "yyyyMMdd")}`) +
      "&location=" + encodeURIComponent(eventConfig.venue_address ?? "")
    : null

  return (
    <section id="details" className="py-20 sm:py-32 px-4 sm:px-6 bg-card/60 backdrop-blur-sm relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <DetailsIntro sectionTitle={sectionTitle} invitationBody={invitationBody} />

        {(blessingsName || blessingsLabel) && (
          <DetailsBlessings blessingsName={blessingsName} blessingsLabel={blessingsLabel} />
        )}

        {detailsList.length > 0 && (
          <DetailsCards detailsList={detailsList} googleCalendarUrl={googleCalendarUrl} />
        )}

        {eventConfig.venue_map_embed_url && (
          <DetailsMap
            embed_url={eventConfig.venue_map_embed_url}
            address={eventConfig.venue_address}
            map_link={eventConfig.venue_map_link}
          />
        )}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 sm:mt-16"
        >
          <motion.div variants={fadeUp(0, 16, 0.7)}>
            <motion.a
              href="#rsvp"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-primary text-primary-foreground px-8 sm:px-12 py-3.5 sm:py-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs sm:text-sm font-bold"
            >
              RSVP Now
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Details
