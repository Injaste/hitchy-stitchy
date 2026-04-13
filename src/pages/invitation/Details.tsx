import { format } from "date-fns";
import { motion, type Variants } from "framer-motion";
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  MapPinCheck,
  Shirt,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicEventConfig } from "./types";

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

const divider: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const Details = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const detailsList = [
    {
      icon: Calendar,
      title: "Date",
      detail: format(eventConfig.dateStart, "do MMMM yyyy"),
      sub: format(eventConfig.dateStart, "EEEE"),
    },
    {
      icon: Clock,
      title: "Time",
      detail: eventConfig.startTime,
      sub: `to ${eventConfig.endTime}`,
    },
    {
      icon: MapPin,
      title: "Location",
      detail: eventConfig.venueName,
      sub: eventConfig.venueAddress,
    },
    {
      icon: Shirt,
      title: "Attire",
      detail: eventConfig.attire,
      sub: "Dress code",
    },
  ];

  const formatGCal = (d: Date) => format(d, "yyyyMMdd'T'HHmmss'Z'");

  const googleCalendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent(eventConfig.name) +
    "&dates=" +
    encodeURIComponent(
      `${formatGCal(eventConfig.dateStart)}/${formatGCal(eventConfig.dateEnd)}`
    ) +
    "&location=" +
    encodeURIComponent(eventConfig.venueAddress);

  return (
    <section
      id="details"
      className="py-20 sm:py-32 px-4 sm:px-6 bg-card/60 backdrop-blur-sm relative z-10"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Intro */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 sm:mb-24"
        >
          <motion.div variants={fadeIn(0)}>
            <Sparkles className="text-primary mx-auto mb-5 sm:mb-6" size={28} />
          </motion.div>
          <motion.h3
            variants={fadeUp(0.1, 20, 0.7)}
            className="text-3xl sm:text-4xl font-bold text-primary mb-4 sm:mb-6 italic"
          >
            A Journey of Love
          </motion.h3>
          <motion.p
            variants={fadeUp(0.25, 16, 0.8)}
            className="text-sm sm:text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto italic"
          >
            "In the name of Allah, the Most Gracious, the Most Merciful. We
            invite you to witness the beginning of our forever. A day where two
            souls become one, guided by faith and bound by love."
          </motion.p>
        </motion.div>

        {/* Blessings */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-14 sm:mb-20"
        >
          <motion.p
            variants={fadeIn(0)}
            className="text-muted-foreground mb-3 sm:mb-4 uppercase tracking-[0.4em] text-[10px] sm:text-xs font-bold"
          >
            With the blessings of
          </motion.p>
          <motion.h3
            variants={fadeUp(0.1, 20, 0.8)}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2"
          >
            {eventConfig.blessingsName}
          </motion.h3>
          <motion.p
            variants={fadeUp(0.2, 12, 0.7)}
            className="text-foreground/70 italic text-sm sm:text-base"
          >
            {eventConfig.blessingsLabel}
          </motion.p>
          <motion.div
            variants={divider}
            style={{ originX: "50%" }}
            className="w-12 sm:w-16 h-px bg-primary/30 mx-auto mt-5 sm:mt-6"
          />
        </motion.div>

        {/* Date / Time / Location cards */}
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
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/20"
              >
                <item.icon size={28} />
              </motion.div>
              <h4 className="font-bold text-base sm:text-xl mb-1 sm:mb-2 text-foreground">
                {item.title}
              </h4>
              <p className="text-primary font-bold text-base sm:text-lg">
                {item.detail}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm italic">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Add to Calendar */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <motion.div variants={fadeUp(0, 12, 0.7)}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs sm:text-sm tracking-wide uppercase h-10 sm:h-11 px-5 sm:px-6"
              >
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CalendarCheck size={16} className="text-primary" />
                  Add to Google Calendar
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl bg-card/50 border border-primary/10 overflow-hidden shadow-sm p-2 sm:p-4"
        >
          <motion.div
            variants={fadeIn(0, 0.9)}
            className="relative w-full aspect-4/3"
          >
            <iframe
              src={eventConfig.venueMapEmbedUrl}
              className="absolute inset-0 w-full h-full border-0 rounded-xl sm:rounded-2xl"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
          <motion.div
            variants={fadeUp(0.15, 10, 0.6)}
            className="p-4 sm:p-5 pb-2 sm:pb-0 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <p className="text-foreground/70 italic text-xs sm:text-sm text-center sm:text-left">
              {eventConfig.venueAddress}
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs tracking-wide uppercase shrink-0"
              >
                <a
                  href={eventConfig.venueMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPinCheck size={14} className="text-primary" />
                  View Map
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RSVP CTA */}
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
  );
};

export default Details;
