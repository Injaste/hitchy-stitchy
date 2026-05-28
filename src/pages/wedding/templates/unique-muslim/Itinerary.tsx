import { motion, type Variants } from "framer-motion";
import { CalendarClock } from "lucide-react";
import type { ThemeProps } from "@/pages/wedding/templates/types";
import { cn } from "@/lib/utils";

const fadeUp = (delay: number, y = 20, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
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
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
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
  const { itinerary, footnote } = config ?? {};

  const sections = parseItinerary(itinerary);
  if (!sections.length) return null;

  return (
    <section
      id="itinerary"
      className="pt-10 pb-20 px-4 bg-[var(--um-card)]/60 relative z-10"
    >
      <div className="max-w-sm mx-auto">
        <div className="flex flex-col gap-8">
          {sections.map((section, si) => (
            <motion.div
              key={si}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeIn(si * 0.08)}
              className="italic"
            >
              {/* Section title */}
              <motion.p
                variants={fadeUp(si * 0.08 + 0.05, 12, 0.6)}
                className="um-couple-names text-4xl font-bold text-center mb-2"
              >
                {section.title}
              </motion.p>

              {/* Items */}
              <div className="flex flex-col max-w-3xs mx-auto w-full">
                {section.items.map((item, ii) => (
                  <motion.div
                    key={ii}
                    variants={fadeUp(si * 0.08 + ii * 0.06 + 0.1, 8, 0.5)}
                    className={cn(
                      "flex items-center gap-4",
                      item.label ? "justify-between" : "justify-center",
                    )}
                  >
                    <span className="tabular-nums shrink-0">{item.time}</span>
                    {item.label && (
                      <span className="text-right leading-snug">
                        {item.label}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          {footnote && (
            <motion.span
              key="footnote"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeIn(sections.length * 0.08)}
              className="text-center leading-snug italic"
            >
              {footnote}
            </motion.span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Itinerary;
