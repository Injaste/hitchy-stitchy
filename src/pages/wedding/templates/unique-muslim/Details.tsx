import { format } from "date-fns";
import { motion, type Variants } from "framer-motion";
import type { ThemeProps } from "@/pages/wedding/templates/types";
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  MapPinCheck,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const deriveMapEmbedUrl = (
  mapLink: string | null | undefined,
): string | null => {
  if (!mapLink) return null;
  try {
    const url = new URL(mapLink);
    const atMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch)
      return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`;
    const q = url.searchParams.get("q");
    if (q)
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  } catch {
    return null;
  }
  return null;
};

const safeFormat = (date: Date, fmt: string) => {
  try {
    return format(date, fmt);
  } catch {
    return null;
  }
};

const Details = ({ eventConfig, pageConfig }: ThemeProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;

  const {
    section_title,
    invitation_body,
    blessings_prefix,
    blessings_name,
    blessings_label,
    dress_code,
    groom_name,
    bride_name,
    date,
    time,
    venue_name,
    venue_address,
    venue_map_link,
    venue_map_embed_url,
  } = config ?? {};

  const mapEmbedUrl = venue_map_embed_url || deriveMapEmbedUrl(venue_map_link);

  const parts = eventConfig.event_date?.split("-").map(Number);
  const eventDate = parts ? new Date(parts[0], parts[1] - 1, parts[2]) : "";

  const detailsList = [
    ...(date
      ? [
          {
            icon: Calendar,
            title: "Date",
            detail: date,
          },
        ]
      : []),
    ...(time
      ? [
          {
            icon: Clock,
            title: "Time",
            detail: time,
          },
        ]
      : []),
    ...(venue_name
      ? [
          {
            icon: MapPin,
            title: "Location",
            detail: venue_name,
          },
        ]
      : []),
    ...(dress_code
      ? [
          {
            icon: Star,
            title: "Dress code",
            detail: dress_code,
          },
        ]
      : []),
  ];

  const googleCalendarUrl = eventDate
    ? "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(`${groom_name ?? ""} ${bride_name ?? ""}`) +
      "&dates=" +
      encodeURIComponent(
        `${safeFormat(eventDate, "yyyyMMdd")}/${safeFormat(eventDate, "yyyyMMdd")}`,
      ) +
      "&location=" +
      encodeURIComponent(venue_address ?? "")
    : null;

  return (
    <section id="details" className="pt-20 pb-10 px-4 bg-card/60 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Intro */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16"
        >
          <motion.div variants={fadeIn(0)}>
            <Sparkles className="text-primary mx-auto mb-5" size={28} />
          </motion.div>
          <motion.h3
            variants={fadeUp(0.1, 20, 0.7)}
            className="text-3xl font-bold text-primary mb-4 italic"
          >
            {section_title}
          </motion.h3>
          <motion.p
            variants={fadeUp(0.25, 16, 0.8)}
            className="text-sm text-foreground/70 leading-relaxed max-w-2xl mx-auto"
          >
            {invitation_body}
          </motion.p>
        </motion.div>

        {/* Blessings */}
        {(blessings_name || blessings_label) && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-14"
          >
            <motion.p
              variants={fadeIn(0)}
              className="text-foreground/70 text-sm mb-3"
            >
              {blessings_prefix}
            </motion.p>
            {blessings_name && (
              <motion.h3
                variants={fadeUp(0.1, 20, 0.8)}
                className="text-3xl font-bold text-primary mb-2 whitespace-pre-line italic"
              >
                {blessings_name}
              </motion.h3>
            )}
            {blessings_label && (
              <motion.p
                variants={fadeUp(0.2, 12, 0.7)}
                className="text-foreground/70 text-sm"
              >
                {blessings_label}
              </motion.p>
            )}
            <motion.div
              variants={divider}
              style={{ originX: "50%" }}
              className="w-12 h-px bg-primary/30 mx-auto mt-5"
            />
          </motion.div>
        )}

        {/* Details cards */}
        {detailsList.length > 0 && (
          <motion.div
            id="date"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 gap-8 mb-14"
          >
            {detailsList.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp(idx * 0.15, 28, 0.7)}
                className="group flex flex-col items-center"
              >
                <motion.div
                  variants={scaleIn(idx * 0.15 + 0.05)}
                  className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/20"
                >
                  <item.icon size={28} />
                </motion.div>
                <h4 className="font-bold text-base mb-1 text-foreground">
                  {item.title}
                </h4>
                <p className="text-primary font-bold text-base">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add to Calendar */}
        {googleCalendarUrl && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12"
          >
            <motion.div variants={fadeUp(0, 12, 0.7)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs tracking-wide uppercase h-10 px-5"
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
        )}

        {/* Map */}
        {mapEmbedUrl && (
          <motion.div
            id="map"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="w-full max-w-xl mx-auto rounded-2xl bg-card/50 border border-primary/10 overflow-hidden shadow-sm p-2"
          >
            <motion.div
              variants={fadeIn(0, 0.9)}
              className="relative w-full aspect-4/3"
            >
              <iframe
                src={mapEmbedUrl}
                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
            <motion.div
              variants={fadeUp(0.15, 10, 0.6)}
              className="p-4 pb-2 flex flex-col items-center justify-between gap-3"
            >
              <p className="text-foreground/70 italic text-xs text-center">
                {venue_address}
              </p>
              {venue_map_link && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs tracking-wide uppercase shrink-0"
                  >
                    <a
                      href={venue_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPinCheck size={14} className="text-primary" />
                      Open Maps
                    </a>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Details;
