import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { TimelineList } from "./TimelineList";

// ─── Day config ───────────────────────────────────────────────────────────────

const DAYS = [
  {
    id: "day1",
    date: "4th July",
    dayName: "Saturday",
    label: "Day 1",
    title: "The Ceremony",
    plan: "7:00 AM – 7:00 PM",
    main: "10:00 AM – 4:00 PM",
  },
  {
    id: "day2",
    date: "5th July",
    dayName: "Sunday",
    label: "Day 2",
    title: "The Reception",
    plan: "10:00 AM – 10:00 PM",
    main: "2:00 PM – 7:00 PM",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TimelineTab reads activePage / setActivePage directly from the store.
 * No props needed — removing props prevents the parent AnimatePresence
 * from re-animating this component when switching between day1 ↔ day2.
 *
 * Structure:
 *   [Tab bar]  — static, never re-animates (outside AnimatePresence)
 *   [Content]  — only the list + heading animates on day change
 */
export function TimelineTab() {
  const { activePage, setActivePage, day1Events, day2Events } = useAdminStore();

  const activeDay = DAYS.find((d) => d.id === activePage) ?? DAYS[0];
  const activeEvents = activePage === "day2" ? day2Events : day1Events;

  // Embla makes the tab bar draggable/swipeable when there are many days.
  // For 2 days it simply renders them statically — no visible difference.
  const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: "keepSnaps" });

  return (
    <div className="w-full">
      {/* ── Tab bar — static, never inside AnimatePresence ── */}
      <div
        ref={emblaRef}
        className="overflow-hidden mb-6 md:mb-8 border-b border-border"
      >
        <div className="flex">
          {DAYS.map((day) => {
            const active = activePage === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActivePage(day.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 px-4 py-3 transition-colors",
                  "focus:outline-none",
                  active
                    ? "bg-primary/5 border-b-2 border-primary"
                    : "hover:bg-muted/40 border-b-2 border-transparent"
                )}
              >
                {/* Line 1 — date */}
                <span
                  className={cn(
                    "font-serif font-bold text-lg leading-tight",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {day.date}
                </span>
                {/* Line 2 — day name */}
                <span className="text-xs text-muted-foreground">{day.dayName}</span>
                {/* Line 3 — label */}
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {day.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content — only this animates on day switch ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Day heading */}
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-primary mb-1 md:mb-2">
              {activeDay.label}: {activeDay.title}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Plan: {activeDay.plan} | Main Event: {activeDay.main}
            </p>
          </div>

          <TimelineList
            events={activeEvents}
            day={activePage as "day1" | "day2"}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
