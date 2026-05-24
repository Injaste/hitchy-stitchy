import { motion, type Variants } from "framer-motion";
import { CalendarClock } from "lucide-react";
import type { ThemeProps } from "@/pages/wedding/templates/types";

const fadeUp = (delay: number, y = 20, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
});

const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration, delay, ease: "easeOut" } },
});

interface ItineraryItem {
  time: string;
  label?: string;
}

interface ItinerarySection {
  title: string;
  items: ItineraryItem[];
}

function parseItinerary(raw: string | null | undefined): ItinerarySection[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lines.length) return [];
      const [title, ...rest] = lines;
      const items = rest.map((line) => {
        const idx = line.indexOf("|");
        if (idx === -1) return { time: line };
        const time = line.slice(0, idx).trim();
        const label = line.slice(idx + 1).trim();
        return { time, ...(label ? { label } : {}) };
      });
      return [{ title, items }];
    });
}

const Itinerary = ({ pageConfig }: ThemeProps) => {
  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const { itinerary_title = "Programme", itinerary } = config ?? {};

  const sections = parseItinerary(itinerary);
  if (!sections.length) return null;

  return (
    <section id="itinerary" className="py-20 px-4 bg-card/60 relative z-10">
      <div className="max-w-sm mx-auto">

        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeIn(0)}>
            <CalendarClock className="text-primary mx-auto mb-5" size={28} />
          </motion.div>
          <motion.h3
            variants={fadeUp(0.1, 20, 0.7)}
            className="text-3xl font-bold text-primary italic"
          >
            {itinerary_title}
          </motion.h3>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          {sections.map((section, si) => (
            <motion.div
              key={si}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeIn(si * 0.08)}
            >
              {/* Section title */}
              <motion.p
                variants={fadeUp(si * 0.08 + 0.05, 12, 0.6)}
                className="text-2xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2"
              >
                {section.title}
              </motion.p>

              {/* Items */}
              <div className="flex flex-col gap-1">
                {section.items.map((item, ii) => (
                  <motion.div
                    key={ii}
                    variants={fadeUp(si * 0.08 + ii * 0.06 + 0.1, 8, 0.5)}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="um-countdown-number text-sm font-bold text-primary tabular-nums shrink-0">
                      {item.time}
                    </span>
                    {item.label && (
                      <span className="text-sm text-foreground/65 text-right leading-snug">
                        {item.label}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Itinerary;
