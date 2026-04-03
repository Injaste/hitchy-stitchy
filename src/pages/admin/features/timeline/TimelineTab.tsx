import { format } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { TimelineList } from "./TimelineList";

export function TimelineTab() {
  const { activePage, setActivePage, eventConfig, events } = useAdminStore();

  const days = eventConfig.days;
  const activeDay = days.find((d) => d.id === activePage) ?? days[0];
  const activeEvents = events[activeDay?.id ?? "day-1"] ?? [];

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "keepSnaps",
  });

  return (
    <div className="w-full">
      {/* ── Tab bar — static, never inside AnimatePresence ── */}
      <div
        ref={emblaRef}
        className="overflow-hidden mb-6 md:mb-8 border-b border-border"
      >
        <div className="flex">
          {days.map((day, index) => {
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
                    : "hover:bg-muted/40 border-b-2 border-transparent",
                )}
              >
                {/* Line 1 — date */}
                <span
                  className={cn(
                    "font-serif font-bold text-lg leading-tight",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {format(day.date, "do MMM")}
                </span>
                {/* Line 2 — day name */}
                <span className="text-xs text-muted-foreground">
                  {format(day.date, "EEEE")}
                </span>
                {/* Line 3 — label */}
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Day {index + 1}
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
          {activeDay && (
            <>
              {/* Day heading */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-serif font-semibold text-primary mb-1 md:mb-2">
                  {activeDay.label}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  {activeDay.venue} ·{" "}
                  {format(activeDay.date, "EEEE, do MMMM yyyy")}
                </p>
              </div>

              <TimelineList events={activeEvents} day={activeDay.id} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
