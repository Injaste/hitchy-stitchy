import { format } from "date-fns";
import { motion, type Variants } from "framer-motion";
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  MapPinCheck,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicEventConfig } from "@/pages/templates/types";

const fadeUp = (delay: number, y = 24, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
});

const scaleIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const Ornament = () => (
  <svg
    viewBox="0 0 80 20"
    className="w-32 h-8 mx-auto text-primary mb-6 sm:mb-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
  >
    <path d="M0 10 H30 M50 10 H80" />
    <polygon points="40,4 44,10 40,16 36,10" fill="currentColor" />
    <circle cx="32" cy="10" r="1.5" fill="currentColor" />
    <circle cx="48" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

const Details = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const appearance = eventConfig.config.appearance;

  const sectionTitle = appearance?.section_title ?? "";
  const invitationBody = appearance?.invitation_body ?? "";
  const blessingsName = appearance?.blessings_name ?? "";
  const blessingsLabel = appearance?.blessings_label ?? "";
  const attire = appearance?.attire ?? "";

  const parts = eventConfig.event_date?.split("-").map(Number);
  const eventDate = parts ? new Date(parts[0], parts[1] - 1, parts[2]) : "";

  const detailsList = [
    ...(eventDate
      ? [
          {
            icon: Calendar,
            title: "Date",
            detail: format(eventDate, "do MMMM yyyy"),
            sub: format(eventDate, "EEEE"),
          },
        ]
      : []),
    ...(eventConfig.event_time_start
      ? [
          {
            icon: Clock,
            title: "Time",
            detail: eventConfig.event_time_start,
            sub: eventConfig.event_time_end
              ? `to ${eventConfig.event_time_end}`
              : "",
          },
        ]
      : []),
    ...(eventConfig.venue_name
      ? [
          {
            icon: MapPin,
            title: "Venue",
            detail: eventConfig.venue_name,
            sub: eventConfig.venue_address ?? "",
          },
        ]
      : []),
    ...(attire
      ? [
          {
            icon: Shirt,
            title: "Attire",
            detail: attire,
            sub: "Dress code",
          },
        ]
      : []),
  ];

  const googleCalendarUrl = eventDate
    ? "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(
        `${eventConfig.groom_name} ${eventConfig.bride_name}`,
      ) +
      "&dates=" +
      encodeURIComponent(
        `${format(eventDate, "yyyyMMdd")}/${format(eventDate, "yyyyMMdd")}`,
      ) +
      "&location=" +
      encodeURIComponent(eventConfig.venue_address ?? "")
    : null;

  return (
    <section
      id="details"
      className="py-20 sm:py-32 px-4 sm:px-6 bg-card/70 relative z-10"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 sm:mb-24"
        >
          <motion.div variants={fadeIn(0)}>
            <Ornament />
          </motion.div>
          <motion.h3
            variants={fadeUp(0.1, 20, 0.7)}
            className="text-3xl sm:text-4xl font-bold text-primary mb-5 sm:mb-7 uppercase tracking-[0.25em] font-display"
          >
            {sectionTitle}
          </motion.h3>
          <motion.p
            variants={fadeUp(0.25, 16, 0.8)}
            className="text-sm sm:text-base md:text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto font-display"
          >
            {invitationBody}
          </motion.p>
        </motion.div>

        {(blessingsName || blessingsLabel) && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-14 sm:mb-20 border-y-2 border-primary/25 py-10 sm:py-14"
          >
            <motion.p
              variants={fadeIn(0)}
              className="text-primary mb-3 sm:mb-4 uppercase tracking-[0.5em] text-2xs sm:text-xs font-bold"
            >
              With the blessings of
            </motion.p>
            {blessingsName && (
              <motion.h3
                variants={fadeUp(0.1, 20, 0.8)}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 uppercase tracking-wide font-display"
              >
                {blessingsName}
              </motion.h3>
            )}
            {blessingsLabel && (
              <motion.p
                variants={fadeUp(0.2, 12, 0.7)}
                className="text-foreground/80 text-sm sm:text-base font-display"
              >
                {blessingsLabel}
              </motion.p>
            )}
          </motion.div>
        )}

        {detailsList.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 md:gap-12 mb-14 sm:mb-16"
          >
            {detailsList.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp(idx * 0.15, 28, 0.7)}
                className="group flex flex-col items-center"
              >
                <motion.div
                  variants={scaleIn(idx * 0.15 + 0.05)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-none rotate-45 bg-card flex items-center justify-center text-primary mb-6 sm:mb-7 group-hover:scale-110 transition-transform duration-500 shadow-md border-2 border-primary/40"
                >
                  <span className="-rotate-45">
                    <item.icon size={26} />
                  </span>
                </motion.div>
                <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground uppercase tracking-widest font-display">
                  {item.title}
                </h4>
                <p className="font-display text-primary font-bold text-base sm:text-lg">
                  {item.detail}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm font-display">
                  {item.sub}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {googleCalendarUrl && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12 sm:mb-16"
          >
            <motion.div variants={fadeUp(0, 12, 0.7)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-2 border-primary/40 hover:border-primary gap-2 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase h-11 px-6 font-display"
                >
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CalendarCheck size={16} className="text-primary" />
                    Add to Calendar
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {eventConfig.venue_map_embed_url && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="w-full max-w-xl mx-auto rounded-none bg-card/60 border-2 border-primary/30 overflow-hidden shadow-md p-2 sm:p-3"
          >
            <motion.div
              variants={fadeIn(0, 0.9)}
              className="relative w-full aspect-4/3"
            >
              <iframe
                src={eventConfig.venue_map_embed_url}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
            <motion.div
              variants={fadeUp(0.15, 10, 0.6)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <p className="text-foreground/80 text-xs sm:text-sm text-center sm:text-left font-display">
                {eventConfig.venue_address}
              </p>
              {eventConfig.venue_map_link && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-none border-2 border-primary/40 gap-2 font-bold text-xs tracking-widest uppercase shrink-0 font-display"
                  >
                    <a
                      href={eventConfig.venue_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPinCheck size={14} className="text-primary" />
                      View Map
                    </a>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
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
              className="inline-block bg-primary text-primary-foreground px-10 sm:px-14 py-3.5 sm:py-4 rounded-none border-2 border-primary shadow-lg hover:bg-primary/90 transition-colors uppercase tracking-[0.3em] text-xs sm:text-sm font-bold font-display"
            >
              RSVP Now
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Details;
