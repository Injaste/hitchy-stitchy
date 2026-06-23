import { useState, useEffect } from "react";
import TimelineCardView from "@/pages/admin/timeline/components/TimelineCardView";
import type { CardLifecycle } from "@/pages/admin/timeline/utils";
import type { Timeline } from "@/pages/admin/timeline/types";
import type { Member } from "@/pages/admin/members/types";
import { HUI_LING, WEI_JIE, SERENE, FAIZ, SELF_ID } from "./sampleTeam";

// Real TimelineCardView (incl. its live start/end controls), with real assignee
// avatars. We drive `lifecycle` directly (it's gated behind editor access in the
// app) to fold in "run it live" — the hero cue toggles ready-to-start ↔ live.
const mk = (
  over: Partial<Timeline> & Pick<Timeline, "id" | "title" | "time_start">,
): Timeline => ({
  event_id: "demo",
  day: "2026-08-02",
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

const CUES: {
  item: Timeline;
  lifecycle: CardLifecycle | "hero";
  who: Member[];
}[] = [
  { item: mk({ id: "c1", title: "敬茶 · Tea Ceremony", time_start: "10:00", time_end: "11:00", details: "Serve tea to elders in seniority — parents first, then grandparents." }), lifecycle: "done", who: [HUI_LING, WEI_JIE] },
  { item: mk({ id: "c2", title: "March-in & Banquet", time_start: "19:30", time_end: "20:30" }), lifecycle: "hero", who: [SERENE, FAIZ] },
  { item: mk({ id: "c3", title: "Yum Seng & Speeches", time_start: "20:45", time_end: "21:15", details: "Three long yum sengs led by the emcee — louder each round." }), lifecycle: null, who: [SERENE] },
];

const HERO_PHASES: CardLifecycle[] = ["start", "end"];

export function TimelineShowcase() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p + 1) % HERO_PHASES.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg select-none space-y-3">
      {CUES.map(({ item, lifecycle, who }) => (
        <TimelineCardView
          key={item.id}
          item={item}
          lifecycle={lifecycle === "hero" ? HERO_PHASES[phase] : lifecycle}
          assigneeMembers={who}
          selfId={SELF_ID}
        />
      ))}
    </div>
  );
}
