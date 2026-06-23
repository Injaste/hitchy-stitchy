import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DateTile from "@/components/custom/date-tile";
import { Separator } from "@/components/ui/separator";
import { dayLabel } from "@/pages/admin/days/utils";
import TimelineCardView from "@/pages/admin/timeline/components/TimelineCardView";
import type { Timeline } from "@/pages/admin/timeline/types";
import type { Member } from "@/pages/admin/members/types";
import { HUI_LING, WEI_JIE, SERENE, FAIZ, SELF_ID } from "./sampleTeam";

// Multi-day weddings, shown the way the app scopes them: a day rail (the real
// DateTile, exactly what DayTabs renders) over the cues filed under the active
// day. Selecting a day re-segments what's below — auto-cycled here so you see
// each day's own running order.
const mkCue = (
  over: Partial<Timeline> & Pick<Timeline, "id" | "title" | "time_start">,
): Timeline => ({
  event_id: "demo",
  day: "2026-08-01",
  segment_id: "seg",
  label: null,
  time_end: null,
  details: null,
  assignees: [],
  created_at: "2026-06-01T00:00:00Z",
  started_at: null,
  ended_at: null,
  ...over,
});

interface Day {
  id: string;
  date: string;
  label: string;
  cues: { item: Timeline; who: Member[] }[];
}

const DAYS: Day[] = [
  {
    id: "d1",
    date: "2026-08-01",
    label: "Solemnisation",
    cues: [
      { item: mkCue({ id: "s1", title: "Sign at the ROM", time_start: "11:00", time_end: "11:30" }), who: [HUI_LING, WEI_JIE] },
      { item: mkCue({ id: "s2", title: "Solemniser's address & vows", time_start: "11:30", time_end: "12:00" }), who: [SERENE] },
    ],
  },
  {
    id: "d2",
    date: "2026-08-02",
    label: "Tea Ceremony",
    cues: [
      { item: mkCue({ id: "t1", title: "敬茶 to the elders", time_start: "09:00", time_end: "10:00" }), who: [HUI_LING, WEI_JIE] },
      { item: mkCue({ id: "t2", title: "Family & jie mei photos", time_start: "10:00", time_end: "10:45" }), who: [SERENE] },
    ],
  },
  {
    id: "d3",
    date: "2026-08-03",
    label: "Banquet",
    cues: [
      { item: mkCue({ id: "b1", title: "March-in & first toast", time_start: "19:30", time_end: "20:00" }), who: [SERENE, FAIZ] },
      { item: mkCue({ id: "b2", title: "Yum seng & live band", time_start: "20:30", time_end: "21:15" }), who: [WEI_JIE, FAIZ] },
    ],
  },
];

export function DaysShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % DAYS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[active];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg select-none">
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

      {/* Keyed (no exit) so the cue list swaps in lockstep with the rail —
          mode="wait" would hold the previous day's cues during the fade-out,
          leaving the rail and the cues momentarily out of sync. */}
      <motion.div
        key={day.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2.5"
      >
        {day.cues.map(({ item, who }) => (
          <TimelineCardView
            key={item.id}
            item={item}
            lifecycle={null}
            assigneeMembers={who}
            selfId={SELF_ID}
          />
        ))}
      </motion.div>
    </div>
  );
}
