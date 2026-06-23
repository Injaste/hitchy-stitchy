import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DateTile from "@/components/custom/date-tile";
import { Separator } from "@/components/ui/separator";
import { dayLabel } from "@/pages/admin/days/utils";
import { formatTime, calculateTimeDuration } from "@/lib/utils/utils-time";

// Multi-day, shown the way the admin timeline scopes it: a day picker (the real
// DateTile, exactly what DayTabs renders) over that day's segments — just the
// segment headings (name + time range), no items inside. Selecting a day swaps
// the segments below. A Chinese multi-day wedding (solemnisation → banquet).
interface Segment {
  name: string;
  start: string;
  end: string;
}
interface Day {
  id: string;
  date: string;
  label: string;
  segments: Segment[];
}

const DAYS: Day[] = [
  {
    id: "d1",
    date: "2026-07-31",
    label: "Solemnisation",
    segments: [
      { name: "ROM ceremony", start: "14:00", end: "15:00" },
      { name: "Tea with witnesses", start: "15:00", end: "16:00" },
    ],
  },
  {
    id: "d2",
    date: "2026-08-01",
    label: "Wedding Day",
    segments: [
      { name: "Gatecrash & fetch bride", start: "07:00", end: "09:00" },
      { name: "敬茶 Tea ceremony", start: "10:00", end: "12:00" },
      { name: "Family lunch", start: "12:30", end: "14:00" },
    ],
  },
  {
    id: "d3",
    date: "2026-08-02",
    label: "Banquet",
    segments: [
      { name: "Reception & march-in", start: "19:00", end: "20:00" },
      { name: "Banquet & yum seng", start: "20:00", end: "22:30" },
    ],
  },
];

export function DaysShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % DAYS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[active];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg select-none">
      {/* Day picker */}
      <div className="flex justify-center gap-2.5">
        {DAYS.map((d, i) => (
          <DateTile
            key={d.id}
            date={d.date}
            active={i === active}
            onClick={() => setActive(i)}
            label={
              <span className={i === active ? "font-medium text-primary" : "text-muted-foreground"}>
                {dayLabel(d.label, i)}
              </span>
            }
          />
        ))}
      </div>

      <Separator className="mt-4 mb-3" />

      {/* That day's segments — headings only (no items). */}
      <motion.div
        key={day.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {day.segments.map((seg, i) => {
          const isLast = i === day.segments.length - 1;
          return (
            <div key={seg.name} className="flex items-stretch gap-3">
              {/* Status-node rail, like the timeline's segment list */}
              <div className="flex flex-col items-center pt-1.5">
                <span className="size-2.5 shrink-0 rounded-full bg-primary/70 ring-4 ring-primary/10" />
                {!isLast && <span className="mt-1 w-px grow bg-border" />}
              </div>
              <div className={`flex flex-wrap items-center gap-2 ${isLast ? "pb-1" : "pb-5"}`}>
                <span className="font-display text-sm font-semibold text-foreground">
                  {seg.name}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-2xs text-muted-foreground">
                  {formatTime(seg.start)} – {formatTime(seg.end)} ·{" "}
                  {calculateTimeDuration(seg.start, seg.end, "short")}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
