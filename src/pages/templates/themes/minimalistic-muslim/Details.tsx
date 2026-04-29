import { format } from "date-fns";
import { motion, type Variants } from "framer-motion";
import { CalendarCheck, MapPinCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicEventConfig } from "@/pages/templates/types";

const fadeUp = (delay: number, y = 16, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const fadeIn = (delay: number, duration = 0.7): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
});

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
            title: "Date",
            detail: format(eventDate, "do MMMM yyyy"),
            sub: format(eventDate, "EEEE"),
          },
        ]
      : []),
    ...(eventConfig.event_time_start
      ? [
          {
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
            title: "Venue",
            detail: eventConfig.venue_name,
            sub: eventConfig.venue_address ?? "",
          },
        ]
      : []),
    ...(attire
      ? [
          {
            title: "Attire",
            detail: attire,
            sub: "",
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
      className="py-24 sm:py-36 px-4 sm:px-6 bg-background relative z-10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-20 sm:mb-28"
        >
          <motion.h3
            variants={fadeUp(0)}
            className="text-2xl sm:text-3xl text-foreground mb-6 sm:mb-8 tracking-tight font-display font-light"
          >
            {sectionTitle}
          </motion.h3>
          <motion.div
            variants={fadeIn(0.1)}
            className="w-12 h-px bg-foreground/20 mx-auto mb-6 sm:mb-8"
          />
          <motion.p
            variants={fadeUp(0.2)}
            className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-xl mx-auto"
          >
            {invitationBody}
          </motion.p>
        </motion.div>

        {(blessingsName || blessingsLabel) && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-20 sm:mb-28"
          >
            <motion.p
              variants={fadeIn(0)}
              className="text-muted-foreground mb-3 uppercase tracking-[0.4em] text-3xs sm:text-2xs"
            >
              With the blessings of
            </motion.p>
            {blessingsName && (
              <motion.h3
                variants={fadeUp(0.1)}
                className="text-xl sm:text-2xl text-foreground mb-2 font-display font-light"
              >
                {blessingsName}
              </motion.h3>
            )}
            {blessingsLabel && (
              <motion.p
                variants={fadeUp(0.2)}
                className="text-foreground/60 text-sm"
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-16 mb-20 sm:mb-24 max-w-xl mx-auto"
          >
            {detailsList.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp(idx * 0.1)}
                className="flex flex-col items-center"
              >
                <p className="text-3xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
                  {item.title}
                </p>
                <p className="font-display text-foreground text-lg sm:text-xl mb-1">
                  {item.detail}
                </p>
                {item.sub && (
                  <p className="text-muted-foreground text-xs">{item.sub}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {googleCalendarUrl && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-16 sm:mb-20"
          >
            <motion.div variants={fadeUp(0)}>
              <Button
                asChild
                variant="ghost"
                className="rounded-none gap-2 text-2xs tracking-[0.3em] uppercase h-10 px-0 border-b border-foreground/30 hover:bg-transparent hover:border-foreground"
              >
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CalendarCheck size={14} />
                  Add to Calendar
                </a>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {eventConfig.venue_map_embed_url && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="w-full max-w-xl mx-auto"
          >
            <motion.div
              variants={fadeIn(0)}
              className="relative w-full aspect-4/3 border border-foreground/10"
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
              variants={fadeUp(0.1)}
              className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <p className="text-foreground/70 text-xs sm:text-sm text-center sm:text-left">
                {eventConfig.venue_address}
              </p>
              {eventConfig.venue_map_link && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-none gap-2 text-2xs tracking-[0.3em] uppercase border-b border-foreground/30 hover:bg-transparent hover:border-foreground px-0 h-auto pb-1"
                >
                  <a
                    href={eventConfig.venue_map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPinCheck size={14} />
                    View Map
                  </a>
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-20 sm:mt-24"
        >
          <motion.a
            href="#rsvp"
            variants={fadeUp(0)}
            whileHover={{ opacity: 0.7 }}
            className="inline-block bg-foreground text-background px-12 sm:px-16 py-3.5 sm:py-4 uppercase tracking-[0.3em] text-2xs sm:text-xs"
          >
            RSVP
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Details;
