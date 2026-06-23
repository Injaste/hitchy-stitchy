import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import TimelineCardView from "@/pages/admin/timeline/components/TimelineCardView";
import type { CardLifecycle } from "@/pages/admin/timeline/utils";
import type { Timeline } from "@/pages/admin/timeline/types";
import type { Member } from "@/pages/admin/members/types";
import { useEmblaCarouselApi } from "@/pages/admin/hooks/embla/useEmblaCarouselApi";
import { useEmblaEdgeDetection } from "@/pages/admin/hooks/embla/useEmblaEdgeDetection";
import { NURUL, HAFIZ, SITI, TIMELINE_SELF } from "./sampleTeam";

// The real TimelineCardView (incl. its live start/end controls) in a real Embla
// carousel (the same hooks the app's LabelCarousel uses). The carousel advances
// cue by cue; the centered cue goes ready → live (start → end ring), then settles
// to done as the next takes over — running a Malay wedding day live.
const mk = (
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

const CUES: { item: Timeline; who: Member[] }[] = [
  { item: mk({ id: "c1", title: "Akad nikah", time_start: "10:00", time_end: "11:00", details: "Ijab kabul before the kadi; witnesses and mas kahwin ready." }), who: [NURUL, HAFIZ] },
  { item: mk({ id: "c2", title: "Kompang & bunga manggar march-in", time_start: "12:30", time_end: "13:00" }), who: [SITI] },
  { item: mk({ id: "c3", title: "Bersanding on the pelamin", time_start: "13:00", time_end: "14:00", details: "Couple sit in state; sprinkling of bunga rampai." }), who: [NURUL, HAFIZ] },
  { item: mk({ id: "c4", title: "Makan beradab", time_start: "14:00", time_end: "15:30" }), who: [SITI] },
  { item: mk({ id: "c5", title: "Henna & well-wishes", time_start: "15:30", time_end: "16:30" }), who: [NURUL] },
];

export function TimelineShowcase() {
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false); // the centered cue: false = ready, true = live
  const { emblaRef, emblaApi } = useEmblaCarouselApi("center", 0);
  const { showLeftFade, showRightFade } = useEmblaEdgeDetection(emblaApi);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % CUES.length), 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(active);
  }, [emblaApi, active]);

  // Each time a cue takes centre stage it starts ready, then goes live.
  useEffect(() => {
    setLive(false);
    const t = setTimeout(() => setLive(true), 1100);
    return () => clearTimeout(t);
  }, [active]);

  const lifecycleFor = (i: number): CardLifecycle =>
    i < active ? "done" : i === active ? (live ? "end" : "start") : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg select-none">
      <div className="mb-3 flex items-center gap-1.5 px-1 text-sm font-medium text-foreground">
        <Clock className="size-4 text-primary" />
        Akad & Bersanding
        <span className="text-muted-foreground/70">· Sat, 1 Aug</span>
      </div>

      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden p-1">
          <div className="flex gap-3">
            {CUES.map(({ item, who }, i) => (
              <div key={item.id} className="w-64 shrink-0 self-stretch sm:w-72">
                <TimelineCardView
                  item={item}
                  lifecycle={lifecycleFor(i)}
                  assigneeMembers={who}
                  selfId={TIMELINE_SELF}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-card to-transparent transition-opacity"
          style={{ opacity: showLeftFade ? 1 : 0 }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-card to-transparent transition-opacity"
          style={{ opacity: showRightFade ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
